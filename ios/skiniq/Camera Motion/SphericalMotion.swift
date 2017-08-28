//
//  SphericalMotion.swift
//  BodyView3D
//
//  Created by mutexre on 06/08/2017.
//  Copyright © 2017 mutexre. All rights reserved.
//

import SceneKit

class SphericalMotion: CameraMotion
{
    typealias Coord = (r: Float, theta: Float, phi: Float)
    
    var center: GLKVector3
    var axisTheta: GLKVector3
    var axisPhi: GLKVector3
    var up: GLKVector3?
    var upFunc: UpFunc?
    var targetFunc: TargetFunc?
    var minR: Float?
    var maxR: Float?
    var minTheta: Float?
    var maxTheta: Float?
    var minPhi: Float?
    var maxPhi: Float?
    var initialCoord: Coord
    var velocity: Coord
    
    internal var currentCoord: Coord
  
    var position: GLKVector3 {
        return convert(currentCoord)
    }
    
    var nativePosition: GLKVector3
    {
        get {
            return GLKVector3Make(currentCoord.phi, currentCoord.theta, currentCoord.r)
        }
        
        set {
            currentCoord.r = newValue.z
            currentCoord.theta = newValue.y
            currentCoord.phi = newValue.x
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

    internal var axisTheta_norm: GLKVector3 {
        return GLKVector3Normalize(axisTheta)
    }
    
    internal var axisPhi_norm: GLKVector3 {
        return GLKVector3Normalize(axisPhi)
    }
    
    init(center: GLKVector3,
         axisTheta: GLKVector3,
         axisPhi: GLKVector3,
         up: GLKVector3? = nil,
         upFunc: UpFunc? = nil,
         targetFunc: TargetFunc? = nil,
         minR: Float? = nil,
         maxR: Float? = nil,
         minTheta: Float? = nil,
         maxTheta: Float? = nil,
         minPhi: Float? = nil,
         maxPhi: Float? = nil,
         initialCoord: Coord,
         velocity: Coord)
    {
        self.center = center
        self.axisTheta = axisTheta
        self.axisPhi = axisPhi
        self.up = up
        self.upFunc = upFunc
        self.targetFunc = targetFunc
        self.minR = minR
        self.maxR = maxR
        self.minTheta = minTheta
        self.maxTheta = maxTheta
        self.minPhi = minPhi
        self.maxPhi = maxPhi
        self.initialCoord = initialCoord
        self.velocity = velocity
        currentCoord = initialCoord
        reset()
    }

//    private func convert(_ xyz: GLKVector3) -> Coord
//    {
//        let v = GLKVector3Make(xyz.x - center.x, xyz.y - center.y, xyz.z - center.z)
//        let dot_v_axisZ = GLKVector3DotProduct(v, axisZ_norm)
//        let z = dot_v_axisZ
//        
//        let lenV = GLKVector3Length(v)
//        let r = sqrt(lenV * lenV - z * z)
//        
//        let zv = GLKVector3MultiplyScalar(axisZ_norm, z)
//        let rv = GLKVector3Subtract(v, zv)
//        let lenRv = GLKVector3Length(rv)
//        let dot_rv_axisR = GLKVector3DotProduct(rv, axisR_norm)
//        let cos = dot_rv_axisR / lenRv
//        let phi = acos(cos)
//        
//        return (r:r, phi:phi, z:z)
//    }
    
    internal func convert(_ coord: Coord) -> GLKVector3
    {
        var r = GLKVector3MultiplyScalar(axisPhi_norm, coord.r)
        
        var rotation = GLKMatrix4Rotate(GLKMatrix4Identity,
                                        coord.theta,
                                        axisTheta_norm.x,
                                        axisTheta_norm.y,
                                        axisTheta_norm.z)
        
        r = GLKMatrix4MultiplyVector3(rotation, r)
        
        rotation = GLKMatrix4Rotate(GLKMatrix4Identity,
                                    coord.phi,
                                    axisPhi_norm.x,
                                    axisPhi_norm.y,
                                    axisPhi_norm.z)
        
        r = GLKMatrix4MultiplyVector3(rotation, r)
        
        return GLKVector3Add(center, r)
    }
    
    private func getDefaultTarget(coord: Coord) -> GLKVector3 {
        return convert(Coord(r: 0, theta: 0.5 * Float.pi, phi: 0.5 * Float.pi))
    }
    
    internal func computePivot(_ eye: Coord) -> GLKMatrix4
    {
        let eyeXyz = convert(eye)
        var targetXyz = target //getDefaultTarget(coord: eye)
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
        currentCoord.phi = (sin(currentCoord.phi) < 0 ? +1 : -1) * 0.5 * Float.pi
    }
    
    func move(_ translation: GLKVector3) -> GLKVector3
    {
        let r = currentCoord.r + velocity.r * translation.z
        let theta = currentCoord.theta - velocity.theta * translation.y
        let phi = currentCoord.phi - velocity.phi * translation.x
      
        let coord = (r: r, theta: theta, phi: phi)
        let (result, remainder) = clamp(coord)
      
        currentCoord = result
      
        return remainder
    }
    
    private func clamp(_ coord: Coord) -> (result: Coord, remainder: GLKVector3)
    {
        let r = clamp(coord.r, min: minR, max: maxR)
        let theta = clamp(coord.theta, min: minTheta, max: maxTheta)
        let phi = clamp(coord.phi, min: minPhi, max: maxPhi)
      
        let result = (r: r.value, theta: theta.value, phi: phi.value)
        let remainder = GLKVector3Make(phi.remainder, theta.remainder, r.remainder)
      
        return (result, remainder)
    }
  
    func moveToPosition(_ position: GLKVector3) -> Bool {
        return false
    }
  
    func getRepresentationVertexGroups(z: Float, nx: Int, ny: Int) -> [[GLKVector3]]
    {
        let minTheta = self.minTheta ?? 0
        let maxTheta = self.maxTheta ?? Float.pi
      
        let minPhi = self.minPhi ?? 0
        let maxPhi = self.maxPhi ?? 2 * Float.pi
      
        let rangeTheta = 0..<ny
        let rangePhi = 0..<nx
      
        let vertices: [GLKVector3] =
          rangeTheta.flatMap { (thetaIndex: Int) -> [GLKVector3] in
              return rangePhi.map { (phiIndex: Int) -> GLKVector3 in
                  let coord = (r: z,
                           theta: minTheta + (maxTheta - minTheta) * Float(thetaIndex) / Float(ny),
                             phi: minPhi + (maxPhi - minPhi) * Float(phiIndex) / Float(nx))
                
                  return self.convert(coord)
              }
          }
      
        return [ vertices ]
    }
}
