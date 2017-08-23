//
//  LegCameraMotion.swift
//  skiniq
//
//  Created by mutexre on 21/08/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

import SceneKit

class LegCameraMotion: CameraMotion
{
//    private enum Segment {
//        case cyl1
//        case torus
//        case cyl2
//        case sphere
//    }

    private var cyl1: CylindricalMotion
    private var torus: ToroidalMotion
    private var cyl2: CylindricalMotion
    private var sphere: SphericalMotion
  
//    var currentSegment: Segment =
  
    init(start: GLKVector3,
         axisZ: GLKVector3,
         axisY: GLKVector3,
         cylLen1: Float,
         cylLen2: Float,
         torusR: Float,
         minR: Float,
         maxR: Float)
    {
        cyl1 = CylindricalMotion(start: start,
                                 axisZ: axisZ,
                                 axisR: axisY,
                                 minR: minR,
                                 maxR: maxR,
                                 minPhi: nil,
                                 maxPhi: nil,
                                 minZ: 0,
                                 maxZ: cylLen1,
                                 initialCoord: (r: 0, phi: 0, z: 0),
                                 velocity: (r: 0.01, phi: 0.01, z: 0.01))
      
        let axisZ_norm = GLKVector3Normalize(axisZ)
        let axisY_norm = GLKVector3Normalize(axisY)
      
        let torusCenter = GLKVector3Add(start, GLKVector3MultiplyScalar(axisZ_norm, cylLen1))
        let torusAxisZ = GLKVector3CrossProduct(axisZ_norm, axisY_norm)
      
        torus = ToroidalMotion(center: torusCenter,
                               axisZ: torusAxisZ,
                               axisR1: axisY,
                               R1: torusR,
                               minR2: minR,
                               maxR2: maxR,
                               minTheta: -Float.pi / 3,
                               maxTheta: +Float.pi / 3,
                               minPhi: nil,
                               maxPhi: nil,
                               initialCoord: (R2: 2, theta: 0, phi: 0),
                               velocity: (R2: 0.01, theta: 0.01, phi: 0.01))
      
        cyl2 = CylindricalMotion(start: start,
                                 axisZ: axisZ,
                                 axisR: axisY,
                                 minR: minR,
                                 maxR: maxR,
                                 minPhi: nil,
                                 maxPhi: nil,
                                 minZ: 0,
                                 maxZ: cylLen1,
                                 initialCoord: (r: 0, phi: 0, z: 0),
                                 velocity: (r: 0.01, phi: 0.01, z: 0.01))

//        sphere = SphericalMotion(center: <#T##GLKVector3#>, axisTheta: <#T##GLKVector3#>, axisPhi: <#T##GLKVector3#>, minR: <#T##Float?#>, maxR: <#T##Float?#>, minTheta: <#T##Float?#>, maxTheta: <#T##Float?#>, minPhi: <#T##Float?#>, maxPhi: <#T##Float?#>, initialCoord: <#T##SphericalMotion.Coord#>, velocity: <#T##SphericalMotion.Coord#>)
    }
}

class LegCameraMotion2: CameraMotion
{
    typealias Coord = (r: Float, phi: Float, z: Float)
    
    var start: GLKVector3
    var axisZ: GLKVector3
    var axisR: GLKVector3
    var cylinderHeight: Float?
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
    
    private var currentCoord: Coord
    
    private var axisZ_norm: GLKVector3 {
        return GLKVector3Normalize(axisZ)
    }
    
    private var axisR_norm: GLKVector3  {
        return GLKVector3Normalize(axisR)
    }
    
    init(start: GLKVector3,
         axisZ: GLKVector3, axisR: GLKVector3,
         minR: Float?, maxR: Float?,
         minPhi: Float?, maxPhi: Float?,
         minZ: Float?, maxZ: Float?,
         initialCoord: Coord,
         velocity: Coord)
    {
        self.start = start
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
        print(coord.phi)
        let zv = GLKVector3MultiplyScalar(axisZ_norm, coord.z)
        let rv = GLKVector3MultiplyScalar(axisR_norm, coord.r)
        
        let rotation = GLKMatrix3Rotate(GLKMatrix3Identity, coord.phi, axisZ_norm.x, axisZ_norm.y, axisZ_norm.z)
        let rv_rotated = GLKMatrix3MultiplyVector3(rotation, rv)
        let zv_plus_rv_rotated = GLKVector3Add(zv, rv_rotated)
        
        return GLKVector3Add(start, zv_plus_rv_rotated)
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
    
    func move(translation: GLKVector3)
    {
        var r = currentCoord.r + velocity.r * translation.z

        r = max(r, minR ?? 0)

        if let maxR = maxR {
            r = min(r, maxR)
        }
        
        var phi = currentCoord.phi - velocity.phi * translation.x
        
        if let minPhi = minPhi {
            phi = max(phi, minPhi)
        }
        
        if let maxPhi = maxPhi {
            phi = min(phi, maxPhi)
        }
        
        var z = currentCoord.z + velocity.z * translation.y
        
        if let minZ = minZ {
            z = max(z, minZ)
        }
        
        if let maxZ = maxZ {
            z = min(z, maxZ)
        }
        
        currentCoord.r = r
        currentCoord.phi = phi
        currentCoord.z = z
    }
    
    func moveToPosition(_ position: GLKVector3) -> Bool {
        return false
    }
}
