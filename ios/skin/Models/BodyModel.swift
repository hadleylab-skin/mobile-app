//
//  Created by mutexre on 14/08/2017.
//  Copyright © 2017 mutexre. All rights reserved.
//

import SceneKit

struct BodyCameraMotionConfig
{
    var center: GLKVector3
    var minR, maxR, r: Float
}

struct HeadCameraMotionConfig
{
    var center: GLKVector3
    var minR, maxR, r: Float
}

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
  
    internal let defaultFov: Double
    internal let bodyConfig: BodyCameraMotionConfig
    internal let headConfig: HeadCameraMotionConfig
    internal let rightArmConfig: ArmCameraMotion.Config
    internal let leftArmConfig: ArmCameraMotion.Config
    internal let rightLegConfig: LegCameraMotion.Config
    internal let leftLegConfig: LegCameraMotion.Config
    internal let showTargetPoints: Bool
  
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
         bodyConfig: BodyCameraMotionConfig,
         headConfig: HeadCameraMotionConfig,
         rightArmConfig: ArmCameraMotion.Config,
         leftArmConfig: ArmCameraMotion.Config,
         rightLegConfig: LegCameraMotion.Config,
         leftLegConfig: LegCameraMotion.Config,
         defaultFov: Double = 60.0,
         showTargetPoints: Bool = false) throws
    {
        self.defaultFov = defaultFov
        self.bodyConfig = bodyConfig
        self.headConfig = headConfig
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
        
        setupSpecialNodes()
        setupBorders(bodyScene)
        
        rootBodyNode.children.forEach {
            $0.flatten()
        }
      
        setupCameraMotion()
        setupCameraTargets()
        setupBodyNodesControlViewItems()
    }
  
    private func setupBorders(_ scene: SCNScene)
    {
        let borders: [(BodyNode, String)] = [
            (head, "Head Border"),
            (rightArm, "Right Arm Border"),
            (leftArm, "Left Arm Border"),
            (rightLeg, "Right Leg Border"),
            (leftLeg, "Left Leg Border")
        ]
        
        for (bodyNode, borderNodeName) in borders
        {
            if let borderNode = scene.rootNode.childNode(withName: borderNodeName, recursively: false) {
                rootNode.addChildNode(borderNode)
                bodyNode.borderNode = borderNode
                borderNode.categoryBitMask = 1 | CategoryBits.border.rawValue
                borderNode.position = SCNVector3Zero
                borderNode.isHidden = true
            }
        }
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

// MARK: -

    func lookupBodyNode(name: String) -> BodyNode? {
        return bodyNodesByName[name]
    }
  
    func lookupBodyNode(sceneNode: SCNNode) -> BodyNode? {
        return bodyNodesBySceneNode[sceneNode]
    }
  
    func makeAllNodeTransparentExceptNode(_ node: BodyNode)
    {
        rootBodyNode.children.filter { $0 != node }.forEach { (bodyNode: BodyNode) in
            bodyNode.opacity = 0.02
        }
    }

    func makeAllNodesOpaque()
    {
        rootBodyNode.children.forEach {
            $0.opacity = 1
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
