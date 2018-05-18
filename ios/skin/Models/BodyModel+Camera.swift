//
//  BodyModel+Camera.swift
//  Skin
//
//  Created by Alexander Obuschenko on 17/04/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

import SceneKit

extension BodyModel
{
    internal func setupCameraMotion()
    {
        setupRootBodyNodeCameraMotion(showSurface: false)
        setupHeadCameraMotion()
        setupArmsCameraMotion(showSurface: false)
        setupLegsCameraMotion()
    }

    internal func setupRootBodyNodeCameraMotion(showSurface: Bool = false)
    {
        rootBodyNode.cameraMotion =
            EllipsoidalMotionWithFlexibleFocusPoint(center: bodyConfig.center,
                                                    axisTheta: GLKVector3Make(0, 0, 1),
                                                    axisPhi: GLKVector3Make(0, 1, 0),
                                                    up: GLKVector3Make(0, 1, 0),
                                                    scale: GLKVector3Make(1.05, 1.3, 1),
                                                    minR: bodyConfig.minR, //5,
                                                    maxR: bodyConfig.maxR, //25,
                                                    minTheta: 0.05 * Float.pi,
                                                    maxTheta: 0.95 * Float.pi,
                                                    initialCoord: (r: bodyConfig.r, theta: 0.5 * Float.pi, phi: 0.5 * Float.pi),
                                                    velocity: (r: 5.0, theta: 0.0125, phi: 0.025))
      
        if showSurface, let repr = rootBodyNode.cameraMotion?.getRepresentationNode(z: 5, nx: 100, ny: 100, color: .black) {
            debugNode.addChildNode(repr)
        }
      
        if showTargetPoints {
            addDebugPoint(at: bodyConfig.center)
        }
    }
  
    internal func setupHeadCameraMotion()
    {
        setSphericalMotion(bodyNode: head,
                           center: headConfig.center,
                           minR: headConfig.minR,
                           maxR: headConfig.maxR,
                           r: headConfig.r,
                           minTheta: 0.25 * Float.pi,
                           maxTheta: 0.7 * Float.pi)
      
        if showTargetPoints {
            addDebugPoint(at: headConfig.center)
        }
    }
  
    internal func setupArmsCameraMotion(showSurface: Bool)
    {
        setupArmCameraMotion(bodyNode: rightArm,
                             config: rightArmConfig,
                             showSurface: showSurface)
      
        setupArmCameraMotion(bodyNode: leftArm,
                             config: leftArmConfig,
                             showSurface: showSurface)
    }
  
    internal func setupLegsCameraMotion()
    {
        setupLegCameraMotion(bodyNode: rightLeg,
                             config: rightLegConfig,
                             showSurface: false)
      
        setupLegCameraMotion(bodyNode: leftLeg,
                             config: leftLegConfig,
                             showSurface: false)
    }
  
    internal func setSphericalMotion(bodyNode: BodyNode,
                                     center: GLKVector3,
                                     minR: Float, maxR: Float, r: Float,
                                     minTheta: Float = 0.1 * Float.pi,
                                     maxTheta: Float = 0.9 * Float.pi,
                                     visualize: Bool = false)
    {
        bodyNode.cameraMotion =
            SphericalMotion(center: center,
                            axisTheta: GLKVector3Make(0, 0, 1),
                            axisPhi: GLKVector3Make(0, 1, 0),
                            up: GLKVector3Make(0, 1, 0),
                            minR: minR,
                            maxR: maxR,
                            minTheta: minTheta,
                            maxTheta: maxTheta,
                            initialCoord: (r: r, theta: 0.5 * Float.pi, phi: 0.5 * Float.pi),
                            velocity: (r: 5.0, theta: 0.025, phi: 0.02))

        if visualize, let repr = bodyNode.cameraMotion?.getRepresentationNode(z: 1, nx: 50, ny: 50, color: .black) {
            debugNode.addChildNode(repr)
        }
    }
  
    internal func setupArmCameraMotion(bodyNode: BodyNode,
                                       config: ArmCameraMotion.Config,
                                       showSurface: Bool = false)
    {
        let axisY_proj_on_axisZ = GLKVector3DotProduct(config.axisZ, config.axisY) / GLKVector3Length(config.axisZ)
        let axisY = GLKVector3Subtract(config.axisY, GLKVector3MultiplyScalar(GLKVector3Normalize(config.axisZ), axisY_proj_on_axisZ))
      
        let dot = GLKVector3DotProduct(config.axisZ, axisY)
        assert(dot < 0.0001)
      
        bodyNode.cameraMotion =
            ArmCameraMotion(origin: config.origin,
                            axisZ: config.axisZ,
                            axisY: axisY,
                            cylinderH1: config.cylinderH1,
                            cylinderH2: config.cylinderH2,
                            torusR: 4,
                            r: config.r,
                            angle: config.angle,
                            initialFov: defaultFov,
                            minFov: 15,
                            maxFov: 80,
                            targetPoints: config.targetPoints)
      
        if showSurface, let repr = bodyNode.cameraMotion?.getRepresentationNode(z: 3, nx: 150, ny: 50, color: .black) {
            debugNode.addChildNode(repr)
        }
    
        if showTargetPoints
        {
            config.targetPoints.forEach {
                addDebugPoint(at: $0.pos)
            }
        }
    }
  
    internal func setupLegCameraMotion(bodyNode: BodyNode,
                                       config: LegCameraMotion.Config,
                                       showSurface: Bool = false)
    {
        let axisY_proj_on_axisZ = GLKVector3DotProduct(config.axisZ, config.axisY) / GLKVector3Length(config.axisZ)
        let axisY = GLKVector3Subtract(config.axisY, GLKVector3MultiplyScalar(GLKVector3Normalize(config.axisZ), axisY_proj_on_axisZ))
      
        let dot = GLKVector3DotProduct(config.axisZ, axisY)
        assert(dot < 0.0001)
      
        bodyNode.cameraMotion =
            LegCameraMotion(origin: config.origin,
                            axisZ: config.axisZ,
                            axisY: axisY,
                            cylinderH: config.cylinderH,
                            torusR: config.torusR,
                            r: config.r,
                            angle: config.angle,
                            initialFov: defaultFov,
                            minFov: 15,
                            maxFov: 80,
                            targetPoints: config.targetPoints)
      
        if showSurface, let repr = bodyNode.cameraMotion?.getRepresentationNode(z: 3, nx: 200, ny: 100, color: .black) {
            debugNode.addChildNode(repr)
        }
    
        if showTargetPoints
        {
            config.targetPoints.forEach {
                addDebugPoint(at: $0.pos)
            }
        }
    }

    private func addDebugPoint(at point: GLKVector3)
    {
        let ball = createBall(size: 0.15, color: .red)
        debugNode.addChildNode(ball)
        ball.position = SCNVector3FromGLKVector3(point)
    }
}
