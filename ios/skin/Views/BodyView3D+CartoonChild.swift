//
//  BodyView3D+Child.swift
//  Skin
//
//  Created by Alexander Obuschenko on 17/04/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

import SceneKit

extension BodyView3D
{
    internal func setupCartoonChild()
    {
        let bodyCenter = GLKVector3Make(0, -1, 0)
        let headCenter = GLKVector3Make(0, 9, -1)
        let rightArmOrigin = GLKVector3Make(-1.75, 3.5, -1.0)
        let leftArmOrigin = GLKVector3Make(1.75, 3.5, -1.0)
        let rightLegOrigin = GLKVector3Make(-1.0, -2, -0.25)
        let leftLegOrigin = GLKVector3Make(1.0, -2, -0.25)
      
        let rightArmTargetPoints: [TargetPoint] = [
            (0.0, rightArmOrigin),
            (1.0, GLKVector3Make(-3.3, 3.25, -1.0)),
            (2.0, GLKVector3Make(-4.8, 3.2, -1.0)),
            (3.0, GLKVector3Make(-8.0, 3.2, -0.5)),
            (4.0, GLKVector3Make(-9.5, 3.2, -0.5))
        ]
      
        let leftArmTargetPoints = rightArmTargetPoints.map { p -> (x: Float, pos: GLKVector3) in
            var p = p
            p.pos.x = -p.pos.x
            return p
        }

        let rightLegTargetPoints: [TargetPoint] = [
            (0.0, rightLegOrigin),
            (1.0, GLKVector3Make(-1.3, -5.5, -0.3)),
            (1.75, GLKVector3Make(-1.3, -9.15, -0.5)),
            (2.0, GLKVector3Make(-1.45, -9.35, 0.15)),
            (3.0, GLKVector3Make(-1.6, -9.6, 0.75))
        ]
      
        let leftLegTargetPoints = rightLegTargetPoints.map { p -> (x: Float, pos: GLKVector3) in
            var p = p
            p.pos.x = -p.pos.x
            return p
        }

        let rightArmConfig =
            ArmCameraMotion.Config(origin: rightArmOrigin,
                                   axisZ: GLKVector3Make(-1.0, 0.0, 0.1),
                                   axisY: GLKVector3Make(0.25, 0, 1),
                                   r: 4,
                                   cylinderH1: 3.5,
                                   cylinderH2: 3.5,
                                   angle: 0.05 * Float.pi / 2,
                                   targetPoints: rightArmTargetPoints)

        let leftArmConfig =
            ArmCameraMotion.Config(origin: leftArmOrigin,
                                   axisZ: GLKVector3Make(1.0, 0.0, 0.1),
                                   axisY: GLKVector3Make(-0.25, 0, 1),
                                   r: 4,
                                   cylinderH1: 3.5,
                                   cylinderH2: 3.5,
                                   angle: 0.05 * Float.pi / 2,
                                   targetPoints: leftArmTargetPoints)
      
        let rightLegConfig =
            LegCameraMotion.Config(origin: rightLegOrigin,
                                   axisZ: GLKVector3Make(-0.0, -1, -0.1),
                                   axisY: GLKVector3Make(-0.25, 0, 1),
                                   r: 4.5,
                                   cylinderH: 3.0,
                                   torusR: 6.0,
                                   angle: (2 / 4) * Float.pi / 2,
                                   targetPoints: rightLegTargetPoints)
      
        let leftLegConfig =
            LegCameraMotion.Config(origin: leftLegOrigin,
                                   axisZ: GLKVector3Make(0.0, -1, -0.1),
                                   axisY: GLKVector3Make(0.25, 0, 1),
                                   r: 4.5,
                                   cylinderH: 3.0,
                                   torusR: 6.0,
                                   angle: (2 / 4) * Float.pi / 2,
                                   targetPoints: leftLegTargetPoints)

        models["cartoon-child"] =
            try! BodyModel(assetName: "art.scnassets/CartoonChild.scn",
                           bodyCenter: bodyCenter,
                           headCenter: headCenter,
                           rightArmConfig: rightArmConfig,
                           leftArmConfig: leftArmConfig,
                           rightLegConfig: rightLegConfig,
                           leftLegConfig: leftLegConfig,
                           showTargetPoints: showTargetPoints)
    }
}
