//
//  Created by mutexre on 14/08/2017.
//  Copyright © 2017 mutexre. All rights reserved.
//

import SceneKit

class BodyModel
{
    var rootBodyNode: BodyNode!

    var rootNode: SCNNode!
    var debugNode = SCNNode()

    var root: BodyNode?
    var head: BodyNode!
    var face: BodyNode!
    var occipitalScalp: BodyNode!
    var trunk: BodyNode!
    var rightArm: BodyNode!
    var leftArm: BodyNode!
    var rightLeg: BodyNode!
    var leftLeg: BodyNode!
  
    var cameraTargets: [ControlsView.Item:CameraTarget] = [:]
    var bodyNodesControlViewItems: [BodyNode:ControlsView.Item] = [:]
  
    private let defaultFov: Double
    private let bodyCenter: GLKVector3
    private let headCenter: GLKVector3
    private let rightArmConfig: ArmCameraMotion.Config
    private let leftArmConfig: ArmCameraMotion.Config
    private let rightLegConfig: LegCameraMotion.Config
    private let leftLegConfig: LegCameraMotion.Config
    private let showTargetPoints: Bool
  
    private var bodyNodesBySceneNode: [SCNNode:BodyNode] = [:]
    private var bodyNodesByName: [String:BodyNode] = [:]
  
    private func processBodyNodesRecursively(bodyNode: BodyNode)
    {
        if let name = bodyNode.name {
            bodyNodesByName[name] = bodyNode
        }
        
        bodyNodesBySceneNode[bodyNode.node] = bodyNode
        
        bodyNode.children.forEach {
            processBodyNodesRecursively(bodyNode: $0)
        }
    }
    
    init(assetName: String,
         bodyCenter: GLKVector3,
         headCenter: GLKVector3,
         rightArmConfig: ArmCameraMotion.Config,
         leftArmConfig: ArmCameraMotion.Config,
         rightLegConfig: LegCameraMotion.Config,
         leftLegConfig: LegCameraMotion.Config,
         defaultFov: Double = 60.0,
         showTargetPoints: Bool = false) throws
    {
        self.defaultFov = defaultFov
        self.bodyCenter = bodyCenter
        self.headCenter = headCenter
        self.rightArmConfig = rightArmConfig
        self.leftArmConfig = leftArmConfig
        self.rightLegConfig = rightLegConfig
        self.leftLegConfig = leftLegConfig
        self.showTargetPoints = showTargetPoints
    
        guard let bodyScene = SCNScene(named: assetName) else {
            throw LoadError.sceneNotFound
        }

        rootNode = bodyScene.rootNode.childNode(withName: "Whole Body", recursively: false)
        
        if rootNode == nil {
            throw LoadError.invalidScene
        }
        
        rootBodyNode = BodyNode(rootNode)
        
        guard let rootBodyNode = rootBodyNode else {
            throw LoadError.invalidScene
        }
        
        processBodyNodesRecursively(bodyNode: rootBodyNode)
        
        rootBodyNode.children.forEach {
            $0.flatten = true
        }
      
        setupSpecialNodes()
        setupCameraMotion()
        setupCameraTargets()
        setupBodyNodesControlViewItems()
    }
  
    private func setupSpecialNodes()
    {
        head = bodyNodesByName["Head"]
        face = bodyNodesByName["Face"]
        trunk = bodyNodesByName["Trunk"]
        rightArm = bodyNodesByName["Right Arm"]
        leftArm = bodyNodesByName["Left Arm"]
        rightLeg = bodyNodesByName["Right Leg"]
        leftLeg = bodyNodesByName["Left Leg"]
    }

    private func setupCameraTargets()
    {
        cameraTargets[.body] = .front
        cameraTargets[.head] = .bodyNode(head)
        cameraTargets[.armR] = .bodyNode(rightArm)
        cameraTargets[.armL] = .bodyNode(leftArm)
        cameraTargets[.legR] = .bodyNode(rightLeg)
        cameraTargets[.legL] = .bodyNode(leftLeg)
        cameraTargets[.back] = .back
    }
    
    private func setupBodyNodesControlViewItems()
    {
        bodyNodesControlViewItems[rootBodyNode] = ControlsView.Item.body
        bodyNodesControlViewItems[head] = ControlsView.Item.head
        bodyNodesControlViewItems[rightArm] = ControlsView.Item.armR
        bodyNodesControlViewItems[leftArm] = ControlsView.Item.armL
        bodyNodesControlViewItems[rightLeg] = ControlsView.Item.legR
        bodyNodesControlViewItems[leftLeg] = ControlsView.Item.legL
    }

    private func setupCameraMotion()
    {
        setupRootBodyNodeCameraMotion()
        setupHeadCameraMotion()
        setupArmsCameraMotion()
        setupLegsCameraMotion()
    }

    private func setupRootBodyNodeCameraMotion(showSurface: Bool = false)
    {
        rootBodyNode.cameraMotion =
            EllipsoidalMotionWithFlexibleFocusPoint(center: bodyCenter,
                                                    axisTheta: GLKVector3Make(0, 0, 1),
                                                    axisPhi: GLKVector3Make(0, 1, 0),
                                                    up: GLKVector3Make(0, 1, 0),
                                                    scale: GLKVector3Make(1.05, 1.3, 1),
                                                    minR: 5,
                                                    maxR: 25,
                                                    minTheta: 0.05 * Float.pi,
                                                    maxTheta: 0.95 * Float.pi,
                                                    initialCoord: (r: 20, theta: 0.5 * Float.pi, phi: 0.5 * Float.pi),
                                                    velocity: (r: 5.0, theta: 0.0125, phi: 0.025))
      
        if showSurface, let repr = rootBodyNode.cameraMotion?.getRepresentationNode(z: 5, nx: 100, ny: 100, color: .black) {
            debugNode.addChildNode(repr)
        }
        
        if showTargetPoints {
            addDebugPoint(at: bodyCenter)
        }
    }
    
    private func setupHeadCameraMotion()
    {
        setSphericalMotion(bodyNode: head,
                           center: headCenter,
                           minR: 3, maxR: 8, r: 5,
                           minTheta: 0.25 * Float.pi,
                           maxTheta: 0.7 * Float.pi)
        
        if showTargetPoints {
            addDebugPoint(at: headCenter)
        }
    }
    
    private func setupArmsCameraMotion()
    {
        setupArmCameraMotion(bodyNode: rightArm,
                             config: rightArmConfig,
                             showSurface: false)
        
        setupArmCameraMotion(bodyNode: leftArm,
                             config: leftArmConfig,
                             showSurface: false)
    }
    
    private func setupLegsCameraMotion()
    {
        setupLegCameraMotion(bodyNode: rightLeg,
                             config: rightLegConfig,
                             showSurface: false)
        
        setupLegCameraMotion(bodyNode: leftLeg,
                             config: leftLegConfig,
                             showSurface: false)
    }
    
    private func setSphericalMotion(bodyNode: BodyNode,
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
  
    private func setupArmCameraMotion(bodyNode: BodyNode,
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
  
    private func setupLegCameraMotion(bodyNode: BodyNode,
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
                            torusR: 4,
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

// MARK: -

    func lookupBodyNode(name: String) -> BodyNode? {
        return bodyNodesByName[name]
    }
  
    func lookupBodyNode(sceneNode: SCNNode) -> BodyNode? {
        return bodyNodesBySceneNode[sceneNode]
    }
  
    func makeAllNodeTransparentExceptNode(_ node: BodyNode)
    {
        rootBodyNode.children.filter { $0 != node }.forEach {
            $0.opacity = 0.02
//            $0.node.isHidden = true
        }
    }

    func makeAllNodesOpaque()
    {
        rootBodyNode.children.forEach {
            $0.opacity = 1
//            $0.node.isHidden = false
        }
    }
}

func createBall(size: Float, color: UIColor) -> SCNNode
{
    let m = SCNMaterial()
    m.lightingModel = .blinn
    m.diffuse.contents = color

    let g = SCNSphere(radius: CGFloat(size))
    g.materials = [ m ]
    
    return SCNNode(geometry: g)
}
