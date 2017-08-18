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
    
    var start: GLKVector3
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
