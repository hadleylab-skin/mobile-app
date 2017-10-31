//
//  CylindricalMotion.swift
//  BodyView3D
//
//  Created by mutexre on 06/08/2017.
//  Copyright © 2017 mutexre. All rights reserved.
//

import SceneKit

class ToroidalMotion: CameraMotion
{
    typealias Coord = (r2: Float, theta: Float, phi: Float)
    
    var center: GLKVector3
    var axisZ: GLKVector3
    var axisR1: GLKVector3
    var up: GLKVector3?
    var upFunc: UpFunc?
    var targetFunc: TargetFunc?
    var r1: Float
  
    var minR2: Float?
    var maxR2: Float?
    var minTheta: Float?
    var maxTheta: Float?
    var minPhi: Float?
    var maxPhi: Float?
  
    var initialCoord: Coord
    var velocity: Coord
  
    var position: GLKVector3 {
        return convert(currentCoord)
    }
  
    var nativePosition: GLKVector3
    {
        get {
            return GLKVector3Make(currentCoord.phi, currentCoord.theta, currentCoord.r2)
        }
        
        set {
            currentCoord.r2 = newValue.z
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
  
    var start: GLKVector3? {
        guard let theta = minTheta else {
            return nil
        }
      
        let coord = getCentralCoord(theta: theta)
        return convert(coord)
    }
  
    var end: GLKVector3? {
        guard let theta = maxTheta else {
            return nil
        }
      
        let coord = getCentralCoord(theta: theta)
        return convert(coord)
    }
  
    func getRadiusVector(theta: Float) -> GLKVector3
    {
        let r1v = GLKVector3MultiplyScalar(axisR1_norm, r1)
        let m = GLKMatrix3MakeRotation(theta, axisZ_norm.x, axisZ_norm.y, axisZ_norm.z)
        return GLKMatrix3MultiplyVector3(m, r1v)
    }
  
    func getTangentVector(theta: Float) -> GLKVector3 {
        return GLKVector3CrossProduct(axisZ_norm, getRadiusVector(theta: theta))
    }
  
    private var currentCoord: Coord
    
    private var axisZ_norm: GLKVector3 {
        return GLKVector3Normalize(axisZ)
    }
    
    private var axisR1_norm: GLKVector3  {
        return GLKVector3Normalize(axisR1)
    }
  
    private func getCentralCoord(theta: Float) -> Coord {
        return (r2: 0, theta: theta, phi: 0)
    }
  
    init(center: GLKVector3,
         axisZ: GLKVector3,
         axisR1: GLKVector3,
         up: GLKVector3? = nil,
         upFunc: UpFunc? = nil,
         targetFunc: TargetFunc? = nil,
         r1: Float,
         minR2: Float? = nil,
         maxR2: Float? = nil,
         minTheta: Float? = nil,
         maxTheta: Float? = nil,
         minPhi: Float? = nil,
         maxPhi: Float? = nil,
         initialCoord: Coord,
         velocity: Coord)
    {
        self.center = center
        self.axisZ = axisZ
        self.axisR1 = axisR1
        self.r1 = r1
        self.up = up
        self.upFunc = upFunc
        self.targetFunc = targetFunc
        self.minR2 = minR2
        self.maxR2 = maxR2
        self.minTheta = minTheta
        self.maxTheta = maxTheta
        self.minPhi = minPhi
        self.maxPhi = maxPhi
      
        self.initialCoord = initialCoord
        self.velocity = velocity
      
        currentCoord = initialCoord
        reset()
    }
  
    convenience init(origin: GLKVector3,
                     dirToCenter: GLKVector3,
                     dir: GLKVector3,
                     up: GLKVector3? = nil,
                     upFunc: UpFunc? = nil,
                     targetFunc: TargetFunc? = nil,
                     r1: Float,
                     minR2: Float? = nil,
                     maxR2: Float? = nil,
                     minTheta: Float? = nil,
                     maxTheta: Float? = nil,
                     minPhi: Float? = nil,
                     maxPhi: Float? = nil,
                     initialCoord: Coord,
                     velocity: Coord)
    {
//        debugPrint("origin = ", origin.x, origin.y, origin.z)
      
        let axisR1 = GLKVector3MultiplyScalar(dirToCenter, -1)

        let dirToCenterNorm = GLKVector3Normalize(dirToCenter)
        let center = GLKVector3Add(origin, GLKVector3MultiplyScalar(dirToCenterNorm, r1))
      
        let axisZ = GLKVector3CrossProduct(dir, dirToCenter)
      
//        debugPrint("center = \(center.x) \(center.y) \(center.z)")
      
        self.init(center: center,
                  axisZ: axisZ,
                  axisR1: axisR1,
                  up: up,
                  upFunc: upFunc,
                  targetFunc: targetFunc,
                  r1: r1,
                  minR2: minR2,
                  maxR2: maxR2,
                  minTheta: minTheta,
                  maxTheta: maxTheta,
                  minPhi: minPhi,
                  maxPhi: maxPhi,
                  initialCoord: initialCoord,
                  velocity: velocity)
    }
  
//    private func convert(_ xyz: GLKVector3) -> Coord
//    {
//        let v = GLKVector3Make(xyz.x - start.x, xyz.y - start.y, xyz.z - start.z)
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
        let r1v = GLKVector3MultiplyScalar(axisR1_norm, r1)
        let r2v = GLKVector3MultiplyScalar(axisR1_norm, coord.r2)
      
        let v = GLKVector3CrossProduct(axisR1_norm, axisZ_norm)
        let r2_rotation = GLKMatrix3Rotate(GLKMatrix3Identity, coord.phi, v.x, v.y, v.z)
        let r2_rotated = GLKMatrix3MultiplyVector3(r2_rotation, r2v)
      
        let r1_plus_r2 = GLKVector3Add(r1v, r2_rotated)
        let r1_plus_r2_rotation = GLKMatrix3Rotate(GLKMatrix3Identity, coord.theta, axisZ_norm.x, axisZ_norm.y, axisZ_norm.z)
        let r1_plus_r2_rotated = GLKMatrix3MultiplyVector3(r1_plus_r2_rotation, r1_plus_r2)
      
        return GLKVector3Add(center, r1_plus_r2_rotated)
    }
    
    private func getDefaultTarget(coord: Coord) -> GLKVector3 {
        let targetNativeCoord = Coord(r2: 0, theta: coord.theta, phi: 0)
        return convert(targetNativeCoord)
    }
    
    private func computePivot(_ eye: Coord) -> GLKMatrix4
    {
        let eyeXyz = convert(eye)
        let targetXyz = target //getDefaultTarget(coord: eye)
        let up = upFunc?(position, nativePosition) ?? self.up ?? GLKVector3Make(0, 1, 0)
        
//        let rv = GLKVector3Subtract(targetXyz, eyeXyz)
//        let dot = GLKVector3DotProduct(rv, up)
//        print("dot=\(dot)")
    
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
        let r2 = currentCoord.r2 + velocity.r2 * translation.z
        let theta = currentCoord.theta - velocity.theta * translation.y
        let phi = currentCoord.phi - velocity.phi * translation.x
      
        let coord = (r2: r2, theta: theta, phi: phi)
        let (result, remainder) = clamp(coord)
      
        currentCoord = result
      
        return remainder
    }
    
    private func clamp(_ coord: Coord) -> (result: Coord, remainder: GLKVector3)
    {
        let r2 = clamp(coord.r2, min: minR2, max: maxR2)
        let theta = clamp(coord.theta, min: minTheta, max: maxTheta)
        let phi = clamp(coord.phi, min: minPhi, max: maxPhi)
      
        let result = (r2: r2.value, theta: theta.value, phi: phi.value)
        let remainder = GLKVector3Make(phi.remainder, theta.remainder, r2.remainder)
      
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
                  let coord = (r2: z,
                            theta: minTheta + (maxTheta - minTheta) * Float(thetaIndex) / Float(ny),
                              phi: minPhi + (maxPhi - minPhi) * Float(phiIndex) / Float(nx))
                
                  return self.convert(coord)
              }
          }
      
        return [ vertices ]
    }
}
