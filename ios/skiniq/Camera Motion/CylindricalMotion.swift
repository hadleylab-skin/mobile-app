//
//  CylindricalMotion.swift
//  BodyView3D
//
//  Created by mutexre on 06/08/2017.
//  Copyright © 2017 mutexre. All rights reserved.
//

import SceneKit

class CylindricalMotion: CameraMotion
{
    typealias Coord = (r: Float, phi: Float, z: Float)
    
    var origin: GLKVector3
    var axisZ: GLKVector3
    var axisR: GLKVector3
    var up: GLKVector3?
    var upFunc: UpFunc?
    var targetFunc: TargetFunc?
    var minR: Float?
    var maxR: Float?
    var minPhi: Float?
    var maxPhi: Float?
    var minZ: Float?
    var maxZ: Float?
    var initialCoord: Coord
    var velocity: Coord
  
    var position: GLKVector3 {
        return convert(currentCoord)
    }

    var nativePosition: GLKVector3
    {
        get {
            return GLKVector3Make(currentCoord.phi, currentCoord.z, currentCoord.r)
        }
        
        set {
            currentCoord.r = newValue.z
            currentCoord.phi = newValue.x
            currentCoord.z = newValue.y
        }
    }

    var target: GLKVector3 {
        return targetFunc?(position, nativePosition) ?? getDefaultTarget(coord: currentCoord)
    }

    var pivot: GLKMatrix4 {
        return computePivot(currentCoord)
    }

    var zoomMode: CameraZoomMode = .translate

    var initialFov: Double?
    var minFov: Double?
    var maxFov: Double?

    var start: GLKVector3? {
        guard let minZ = minZ else {
            return nil
        }
      
        return GLKVector3Add(origin, GLKVector3MultiplyScalar(axisZ_norm, minZ))
    }
  
    var end: GLKVector3? {
        guard let maxZ = maxZ else {
            return nil
        }
      
        return GLKVector3Add(origin, GLKVector3MultiplyScalar(axisZ_norm, maxZ))
    }
  
    private var currentCoord: Coord
    
    private var axisZ_norm: GLKVector3 {
        return GLKVector3Normalize(axisZ)
    }
    
    private var axisR_norm: GLKVector3  {
        return GLKVector3Normalize(axisR)
    }
    
    init(origin: GLKVector3,
         axisZ: GLKVector3,
         axisR: GLKVector3,
         up: GLKVector3? = nil,
         upFunc: UpFunc? = nil,
         targetFunc: TargetFunc? = nil,
         minR: Float? = nil,
         maxR: Float? = nil,
         minPhi: Float? = nil,
         maxPhi: Float? = nil,
         minZ: Float? = nil,
         maxZ: Float? = nil,
         initialCoord: Coord,
         velocity: Coord)
    {
        self.origin = origin
        self.axisZ = axisZ
        self.axisR = axisR
        self.up = up
        self.upFunc = upFunc
        self.targetFunc = targetFunc
        self.minR = minR
        self.maxR = maxR
        self.minPhi = minPhi
        self.maxPhi = maxPhi
        self.minZ = minZ
        self.maxZ = maxZ
        self.initialCoord = initialCoord
        self.velocity = velocity
        currentCoord = initialCoord
        reset()
    }
    
    private func convert(_ xyz: GLKVector3) -> Coord
    {
        let v = GLKVector3Make(xyz.x - origin.x, xyz.y - origin.y, xyz.z - origin.z)
        let dot_v_axisZ = GLKVector3DotProduct(v, axisZ_norm)
        let z = dot_v_axisZ
        
        let lenV = GLKVector3Length(v)
        let r = sqrt(lenV * lenV - z * z)
        
        let zv = GLKVector3MultiplyScalar(axisZ_norm, z)
        let rv = GLKVector3Subtract(v, zv)
        let len_rv = GLKVector3Length(rv)
        let dot_rv_axisR = GLKVector3DotProduct(rv, axisR_norm)
        let cos = dot_rv_axisR / len_rv
        let phi = acos(cos)
        
        return (r: r, phi: phi, z: z)
    }
  
    internal func convert(_ coord: Coord) -> GLKVector3
    {
        let zv = GLKVector3MultiplyScalar(axisZ_norm, coord.z)
        let rv = GLKVector3MultiplyScalar(axisR_norm, coord.r)
        
        let rotation = GLKMatrix3Rotate(GLKMatrix3Identity, coord.phi, axisZ_norm.x, axisZ_norm.y, axisZ_norm.z)
        let rv_rotated = GLKMatrix3MultiplyVector3(rotation, rv)
        let zv_plus_rv_rotated = GLKVector3Add(zv, rv_rotated)
        
        return GLKVector3Add(origin, zv_plus_rv_rotated)
    }
    
    private func getDefaultTarget(coord: Coord) -> GLKVector3 {
        return convert(Coord(r: 0, phi: coord.phi, z: coord.z))
    }
    
    private func computePivot(_ coord: Coord) -> GLKMatrix4
    {
        let eyeXyz = convert(coord)
        var targetXyz = target //getDefaultTarget(coord: coord)
        let up = upFunc?(position, nativePosition) ?? self.up ?? GLKVector3Make(0, 1, 0)
    
        let pivot = GLKMatrix4MakeLookAt(0, 0, 0,
                                         targetXyz.x - eyeXyz.x,
                                         targetXyz.y - eyeXyz.y,
                                         targetXyz.z - eyeXyz.z,
                                         up.x, up.y, up.z)
        
        return pivot
    }
  
    func reset() {
        currentCoord = initialCoord
    }
    
    func toggleFrontBack() {
        currentCoord.phi = cos(currentCoord.phi) > 0 ? Float.pi : 0
    }
    
    func move(_ translation: GLKVector3) -> GLKVector3
    {
        let r = currentCoord.r + velocity.r * translation.z
        let phi = currentCoord.phi - velocity.phi * translation.x
        let z = currentCoord.z + velocity.z * translation.y
      
        let coord = (r: r, phi: phi, z: z)
        let (result, remainder) = clamp(coord)
      
        currentCoord = result
      
        return remainder
    }
  
    private func clamp(_ coord: Coord) -> (result: Coord, remainder: GLKVector3)
    {
        let r = clamp(coord.r, min: minR, max: maxR)
        let phi = clamp(coord.phi, min: minPhi, max: maxPhi)
        let z = clamp(coord.z, min: minZ, max: maxZ)
      
        let result = (r: r.value, phi: phi.value, z: z.value)
        let remainder = GLKVector3Make(phi.remainder, z.remainder, r.remainder)
      
        return (result, remainder)
    }
  
    func moveToPosition(_ position: GLKVector3) -> Bool {
        return false
    }
  
    func getRepresentationVertexGroups(z: Float, nx: Int, ny: Int) -> [[GLKVector3]]
    {
        guard let minZ = minZ,
              let maxZ = maxZ
        else {
            return []
        }
      
        let minPhi = self.minPhi ?? 0
        let maxPhi = self.maxPhi ?? 2 * Float.pi
      
        let rangeZ = 0..<ny
        let rangePhi = 0..<nx
      
        let vertices: [GLKVector3] =
          rangeZ.flatMap { (zIndex: Int) -> [GLKVector3] in
              return rangePhi.map { (phiIndex: Int) -> GLKVector3 in
                  let coord = (r: z,
                             phi: minPhi + (maxPhi - minPhi) * Float(phiIndex) / Float(nx),
                               z: minZ + (maxZ - minZ) * Float(zIndex) / Float(ny))
                  return self.convert(coord)
            }
        }
      
        return [ vertices ]
    }
}
