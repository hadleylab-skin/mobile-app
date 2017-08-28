//
//  Created by mutexre on 07/08/2017.
//  Copyright © 2017 mutexre. All rights reserved.
//

import SceneKit

class EllipsoidalMotionWithFlexibleFocusPoint: SphericalMotion
{
    var scale: GLKVector3

    init(center: GLKVector3,
         axisTheta: GLKVector3,
         axisPhi: GLKVector3,
         up: GLKVector3,
         scale: GLKVector3,
         minR: Float? = nil,
         maxR: Float? = nil,
         minTheta: Float? = nil,
         maxTheta: Float? = nil,
         minPhi: Float? = nil,
         maxPhi: Float? = nil,
         initialCoord: Coord,
         velocity: Coord)
    {
        self.scale = scale
        super.init(center: center,
                   axisTheta: axisTheta,
                   axisPhi: axisPhi,
                   up: up,
                   upFunc: nil,
                   targetFunc: nil,
                   minR: minR,
                   maxR: maxR,
                   minTheta: minTheta,
                   maxTheta: maxTheta,
                   minPhi: minPhi,
                   maxPhi: maxPhi,
                   initialCoord: initialCoord,
                   velocity: velocity)
    }

    override internal func convert(_ coord: Coord) -> GLKVector3
    {
        var coord = coord
        if coord.r > 0.001
        {
            let s1 = pow(abs(cos(coord.theta)), 3)
            let s2 = pow((1 - s1) * abs(sin(coord.phi + 0.5 * Float.pi)), 3)
            coord.r = coord.r + s1 * 7.5 + s2 * 1.0
        }
        
        return super.convert(coord)
    }
    
    internal override func computePivot(_ coord: Coord) -> GLKMatrix4
    {
        let centerCoord = Coord(r: 0, theta: 0.5 * Float.pi, phi: 0.5 * Float.pi)
        let xyz = convert(coord)
        let centerXyz = GLKVector3Add(convert(centerCoord), GLKVector3MultiplyScalar(axisPhi_norm, 7.5 * cos(coord.theta)))
        
        let pivot = GLKMatrix4MakeLookAt(0, 0, 0,
                                         centerXyz.x - xyz.x,
                                         centerXyz.y - xyz.y,
                                         centerXyz.z - xyz.z,
                                         axisPhi.x, axisPhi.y, axisPhi.z)
        
        return pivot
    }
}
