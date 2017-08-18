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
    
    var pivot: GLKMatrix4 {
        return computePivot(currentCoord)
    }
    
    internal var axisTheta_norm: GLKVector3 {
        return GLKVector3Normalize(axisTheta)
    }
    
    internal var axisPhi_norm: GLKVector3 {
        return GLKVector3Normalize(axisPhi)
    }
    
    init(center: GLKVector3, axisTheta: GLKVector3, axisPhi: GLKVector3,
         minR: Float?, maxR: Float?,
         minTheta: Float?, maxTheta: Float?,
         minPhi: Float?, maxPhi: Float?,
         initialCoord: Coord,
         velocity: Coord)
    {
        self.center = center
        self.axisTheta = axisTheta
        self.axisPhi = axisPhi
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
    
    internal func computePivot(_ coord: Coord) -> GLKMatrix4
    {
        let centerCoord = Coord(r: 0, theta: 0.5 * Float.pi, phi: 0.5 * Float.pi)
        let xyz = convert(coord)
        let centerXyz = convert(centerCoord)
        
        let pivot = GLKMatrix4MakeLookAt(0, 0, 0,
                                         centerXyz.x - xyz.x,
                                         centerXyz.y - xyz.y,
                                         centerXyz.z - xyz.z,
                                         axisPhi.x, axisPhi.y, axisPhi.z)
        
        return pivot
    }

    func reset() {
        currentCoord = initialCoord
    }
    
    func toggleFrontBack() {
        currentCoord.phi = (sin(currentCoord.phi) < 0 ? +1 : -1) * 0.5 * Float.pi
    }

    private func calcR(delta: Float) -> Float
    {
        var r = currentCoord.r + velocity.r * delta
        
        r = max(r, minR ?? 0)

        if let maxR = maxR {
            r = min(r, maxR)
        }
        
        return r
    }

    private func calcTheta(delta: Float) -> Float
    {
        var theta = currentCoord.theta - velocity.theta * delta
        
        if let minTheta = minTheta {
            theta = max(theta, minTheta)
        }
        
        if let maxTheta = maxTheta {
            theta = min(theta, maxTheta)
        }
        
        return theta
    }
    
    private func calcPhi(delta: Float) -> Float
    {
        var phi = currentCoord.phi - velocity.phi * delta
        
        if let minPhi = minPhi {
            phi = max(phi, minPhi)
        }
        
        if let maxPhi = maxPhi {
            phi = min(phi, maxPhi)
        }
        
        return phi
    }
    
    func move(translation: GLKVector3)
    {
        currentCoord.r = calcR(delta: translation.z)
        currentCoord.theta = calcTheta(delta: translation.y)
        currentCoord.phi = calcPhi(delta: translation.x)
    }
    
    func moveToPosition(_ position: GLKVector3) -> Bool {
        return false
    }
}
