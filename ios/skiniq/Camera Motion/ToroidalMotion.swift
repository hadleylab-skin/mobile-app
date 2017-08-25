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
    typealias Coord = (R2: Float, theta: Float, phi: Float)
    
    var center: GLKVector3
    var axisZ: GLKVector3
    var axisR1: GLKVector3
    var R1: Float
  
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
  
    var pivot: GLKMatrix4 {
        return computePivot(currentCoord)
    }

    typealias T = CameraMotion

    var prev: CameraMotion?
    var next: CameraMotion?
  
    var zoomMode: CameraZoomMode {
        return .translate
    }
  
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
  
    private var currentCoord: Coord
    
    private var axisZ_norm: GLKVector3 {
        return GLKVector3Normalize(axisZ)
    }
    
    private var axisR1_norm: GLKVector3  {
        return GLKVector3Normalize(axisR1)
    }
  
    private func getCentralCoord(theta: Float) -> Coord {
        return (R2: 0, theta: theta, phi: 0)
    }
  
    init(center: GLKVector3,
         axisZ: GLKVector3,
         axisR1: GLKVector3,
         R1: Float,
         minR2: Float?, maxR2: Float?,
         minTheta: Float?, maxTheta: Float?,
         minPhi: Float?, maxPhi: Float?,
         initialCoord: Coord,
         velocity: Coord)
    {
        self.center = center
        self.axisZ = axisZ
        self.axisR1 = axisR1
        self.R1 = R1
      
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
                     R1: Float,
                     minR2: Float?, maxR2: Float?,
                     minTheta: Float?, maxTheta: Float?,
                     minPhi: Float?, maxPhi: Float?,
                     initialCoord: Coord,
                     velocity: Coord)
    {
        let axisR1 = GLKVector3MultiplyScalar(dirToCenter, -1)

        let dirToCenterNorm = GLKVector3Normalize(dirToCenter)
        let center = GLKVector3Add(origin, GLKVector3MultiplyScalar(dirToCenterNorm, R1))
      
        let axisZ = GLKVector3CrossProduct(dir, dirToCenter)
      
        self.init(center: center,
                  axisZ: axisZ,
                  axisR1: axisR1,
                  R1: R1,
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
        let r1 = GLKVector3MultiplyScalar(axisR1_norm, R1)
        let r2 = GLKVector3MultiplyScalar(axisR1_norm, coord.R2)
      
        let v = GLKVector3CrossProduct(axisR1_norm, axisZ_norm)
        let r2_rotation = GLKMatrix3Rotate(GLKMatrix3Identity, coord.phi, v.x, v.y, v.z)
        let r2_rotated = GLKMatrix3MultiplyVector3(r2_rotation, r2)
      
        let r1_plus_r2 = GLKVector3Add(r1, r2_rotated)
        let r1_plus_r2_rotation = GLKMatrix3Rotate(GLKMatrix3Identity, coord.theta, axisZ_norm.x, axisZ_norm.y, axisZ_norm.z)
        let r1_plus_r2_rotated = GLKMatrix3MultiplyVector3(r1_plus_r2_rotation, r1_plus_r2)
      
        return r1_plus_r2_rotated
    }
    
    private func computePivot(_ coord: Coord) -> GLKMatrix4
    {
        let centerCoord = Coord(R2: 0, theta: coord.theta, phi: 0)
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
        var R2 = currentCoord.R2 + velocity.R2 * translation.z

        R2 = max(R2, minR2 ?? 0)

        if let maxR2 = maxR2 {
            R2 = min(R2, maxR2)
        }
      
        var theta = currentCoord.theta - velocity.theta * translation.x
        
        if let minTheta = minTheta {
            theta = max(theta, minTheta)
        }
        
        if let maxTheta = maxTheta {
            theta = min(theta, maxTheta)
        }
      
        var phi = currentCoord.phi - velocity.phi * translation.y
        
        if let minPhi = minPhi {
            phi = max(phi, minPhi)
        }
        
        if let maxPhi = maxPhi {
            phi = min(phi, maxPhi)
        }
        
        currentCoord.R2 = R2
        currentCoord.theta = theta
        currentCoord.phi = phi
      
        return false
    }
    
    func moveToPosition(_ position: GLKVector3) -> Bool {
        return false
    }
  
    func getRepresentationVertices(z: Float, nx: Int, ny: Int) -> [GLKVector3]?
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
                  let coord = (R2: z,
                            theta: minTheta + (maxTheta - minTheta) * Float(thetaIndex) / Float(ny),
                              phi: minPhi + (maxPhi - minPhi) * Float(phiIndex) / Float(nx))
                
                  return self.convert(coord)
              }
          }
      
        return vertices
    }
}
