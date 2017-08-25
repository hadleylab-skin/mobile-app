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

    var pivot: GLKMatrix4 {
        return computePivot(currentCoord)
    }

    var zoomMode: CameraZoomMode {
        return .translate
    }

    var prev: CameraMotion?
    var next: CameraMotion?

    var start: GLKVector3? {
        guard let minZ = minZ else {
            return nil
        }
      
        return GLKVector3Add(origin, GLKVector3MultiplyScalar(axisZ, minZ))
    }
  
    var end: GLKVector3? {
        guard let maxZ = maxZ else {
            return nil
        }
      
        return GLKVector3Add(origin, GLKVector3MultiplyScalar(axisZ, maxZ))
    }
  
    private var currentCoord: Coord
    
    private var axisZ_norm: GLKVector3 {
        return GLKVector3Normalize(axisZ)
    }
    
    private var axisR_norm: GLKVector3  {
        return GLKVector3Normalize(axisR)
    }
    
    init(origin: GLKVector3,
         axisZ: GLKVector3, axisR: GLKVector3,
         minR: Float?, maxR: Float?,
         minPhi: Float?, maxPhi: Float?,
         minZ: Float?, maxZ: Float?,
         initialCoord: Coord,
         velocity: Coord)
    {
        self.origin = origin
        self.axisZ = axisZ
        self.axisR = axisR
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
        print(coord.phi)
        let zv = GLKVector3MultiplyScalar(axisZ_norm, coord.z)
        let rv = GLKVector3MultiplyScalar(axisR_norm, coord.r)
        
        let rotation = GLKMatrix3Rotate(GLKMatrix3Identity, coord.phi, axisZ_norm.x, axisZ_norm.y, axisZ_norm.z)
        let rv_rotated = GLKMatrix3MultiplyVector3(rotation, rv)
        let zv_plus_rv_rotated = GLKVector3Add(zv, rv_rotated)
        
        return GLKVector3Add(origin, zv_plus_rv_rotated)
    }
    
    private func computePivot(_ coord: Coord) -> GLKMatrix4
    {
        let centerCoord = Coord(r:0, phi:coord.phi, z:coord.z)
        let xyz = convert(coord)
        let centerXyz = convert(centerCoord)
        
        let pivot = GLKMatrix4MakeLookAt(0, 0, 0,
                                         centerXyz.x - xyz.x,
                                         centerXyz.y - xyz.y,
                                         centerXyz.z - xyz.z,
                                         axisZ.x, axisZ.y, axisZ.z)
        
        return pivot
    }
  
    func reset() {
        currentCoord = initialCoord
    }
    
    func toggleFrontBack() {
        currentCoord.phi = cos(currentCoord.phi) > 0 ? Float.pi : 0
    }
    
    func move(_ translation: GLKVector3) -> Bool
    {
        let r = currentCoord.r + velocity.r * translation.z
        let phi = currentCoord.phi - velocity.phi * translation.x
        let z = currentCoord.z + velocity.z * translation.y
      
        let coord = (r: r, phi: phi, z: z)
        var outOfBounds: Bool
        (currentCoord, outOfBounds) = clamp(coord)
      
        return outOfBounds
    }
  
    private func clamp(_ coord: Coord) -> (coord: Coord, outOfBounds: Bool)
    {
        var clampedCoord = coord
      
        let cR = clampR(&clampedCoord)
        let cPhi = clampPhi(&clampedCoord)
        let cZ = clampZ(&clampedCoord)
        let outOfBounds = cR || cPhi || cZ
      
        return (clampedCoord, outOfBounds)
    }
  
    private func clampR(_ coord: inout Coord) -> Bool
    {
        var outOfBounds = false
      
        if let minR = minR {
            if coord.r < minR {
                coord.r = minR
                outOfBounds = true
            }
        }

        if let maxR = maxR {
            if coord.r > maxR {
                coord.r = maxR
                outOfBounds = true
            }
        }
      
        return outOfBounds
    }
  
    private func clampPhi(_ coord: inout Coord) -> Bool
    {
        var outOfBounds = false
      
        if let minPhi = minPhi {
            if coord.phi < minPhi {
                coord.phi = minPhi
                outOfBounds = true
            }
        }
        
        if let maxPhi = maxPhi {
            if coord.phi > maxPhi {
                coord.phi = maxPhi
                outOfBounds = true
            }
        }
      
        return outOfBounds
    }
  
    private func clampZ(_ coord: inout Coord) -> Bool
    {
        var outOfBounds = false
      
        if let minZ = minZ {
            if coord.z < minZ {
                coord.z = minZ
                outOfBounds = true
            }
        }
        
        if let maxZ = maxZ {
            if coord.z > maxZ {
                coord.z = maxZ
                outOfBounds = true
            }
        }
      
        return outOfBounds
    }
  
    func moveToPosition(_ position: GLKVector3) -> Bool {
        return false
    }
  
    func getRepresentationVertices(z: Float, nx: Int, ny: Int) -> [GLKVector3]?
    {
        guard let minZ = minZ,
              let maxZ = maxZ
        else {
            return nil
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
      
        return vertices
    }
}
