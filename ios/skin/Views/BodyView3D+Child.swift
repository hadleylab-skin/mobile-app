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
    internal func setupChild()
    {
        let bodyCenter = GLKVector3Make(0, -1, 0)
        let headCenter = GLKVector3Make(0, 6.75, 0)
        let rightArmOrigin = GLKVector3Make(-1.75, 4, -0.5)
        let leftArmOrigin = GLKVector3Make(1.75, 4, -0.5)
        let rightLegOrigin = GLKVector3Make(-1.0, -2, -0.25)
        let leftLegOrigin = GLKVector3Make(1.0, -2, -0.25)
      
        let rightArmTargetPoints: [TargetPoint] = [
            (0.0, rightArmOrigin),
            (1.0, GLKVector3Make(-2.25, 2.7, -0.65)),
            (2.0, GLKVector3Make(-2.75, 1.4, -0.7)),
            (3.0, GLKVector3Make(-3.8, -0.7, -0.25)),
            (4.0, GLKVector3Make(-4.0, -1.5, 0))
        ]
      
        let leftArmTargetPoints = rightArmTargetPoints.map { p -> (x: Float, pos: GLKVector3) in
            var p = p
            p.pos.x = -p.pos.x
            return p
        }

        let rightLegTargetPoints: [TargetPoint] = [
            (0.0, rightLegOrigin),
            (1.0, GLKVector3Make(-1.0, -5.5, -0.3)),
            (1.75, GLKVector3Make(-1.0, -10.25, -0.5)),
            (2.0, GLKVector3Make(-1.1, -10.4, 0.15)),
            (3.0, GLKVector3Make(-1.2, -10.5, 0.75))
        ]
      
        let leftLegTargetPoints = rightLegTargetPoints.map { p -> (x: Float, pos: GLKVector3) in
            var p = p
            p.pos.x = -p.pos.x
            return p
        }

        let rightArmConfig =
            ArmCameraMotion.Config(origin: rightArmOrigin,
                                   axisZ: GLKVector3Make(-1.25, -3.2, -0.2),
                                   axisY: GLKVector3Make(0.25, 0, 1),
                                   r: 4,
                                   cylinderH1: 2,
                                   cylinderH2: 2,
                                   angle: 0.2 * Float.pi / 2,
                                   targetPoints: rightArmTargetPoints)

        let leftArmConfig =
            ArmCameraMotion.Config(origin: leftArmOrigin,
                                   axisZ: GLKVector3Make(1.25, -3.2, -0.2),
                                   axisY: GLKVector3Make(-0.25, 0, 1),
                                   r: 4,
                                   cylinderH1: 2,
                                   cylinderH2: 2,
                                   angle: 0.2 * Float.pi / 2,
                                   targetPoints: leftArmTargetPoints)
      
        let rightLegConfig =
            LegCameraMotion.Config(origin: rightLegOrigin,
                                   axisZ: GLKVector3Make(-0.025, -1, -0.1),
                                   axisY: GLKVector3Make(-0.25, 0, 1),
                                   r: 4,
                                   cylinderH: 3.5,
                                   angle: (2 / 3) * Float.pi / 2,
                                   targetPoints: rightLegTargetPoints)
      
        let leftLegConfig =
            LegCameraMotion.Config(origin: leftLegOrigin,
                                   axisZ: GLKVector3Make(0.025, -1, -0.1),
                                   axisY: GLKVector3Make(0.25, 0, 1),
                                   r: 4,
                                   cylinderH: 3.5,
                                   angle: (2 / 3) * Float.pi / 2,
                                   targetPoints: leftLegTargetPoints)

        models["child"] =
            try! BodyModel(assetName: "art.scnassets/Child.scn",
                           bodyCenter: bodyCenter,
                           headCenter: headCenter,
                           rightArmConfig: rightArmConfig,
                           leftArmConfig: leftArmConfig,
                           rightLegConfig: rightLegConfig,
                           leftLegConfig: leftLegConfig,
                           showTargetPoints: showTargetPoints)
    }
}
