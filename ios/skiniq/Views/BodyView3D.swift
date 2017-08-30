//
//  BodyView.swift
//  BodyView3D
//
//  Created by mutexre on 14/08/2017.
//  Copyright © 2017 mutexre. All rights reserved.
//

import UIKit
import SceneKit
import SnapKit

enum LoadError: Error {
    case sceneNotFound
    case invalidScene
}

enum CameraTarget
{
    case front
    case back
    case bodyNode(BodyNode)
}

@objc protocol BodyViewDelegate
{
    func bodyView(_ bodyView: BodyView3D, bodyNodeSelected bodyPart: String?)
    func bodyView(_ bodyView: BodyView3D, nevusAdded nevus: Nevus)
    func bodyView(_ bodyView: BodyView3D, nevusSelected nevus: Nevus)
}

class BodyView3D: UIView, ControlsViewDelegate, SCNSceneRendererDelegate
{
    var delegate: BodyViewDelegate?
  
    var sex: String = "male" {
        didSet {
            print("Sex selected: \(sex)")
            updateModel()
        }
    }
  
    var removeMole: Bool = false {
        didSet {
            if removeMole {
                print("Removed new mole")
                newNevus = nil
            }
        }
    }
  
    private func showNevi(for bodyNode: BodyNode?)
    {
        guard let bodyNode = bodyNode else
        {
            nevi.forEach { nevus in
                nevus.node.isHidden = true
            }
            return
        }
      
        nevi.forEach { nevus in
            nevus.node.isHidden = (nevus.bodyNode != bodyNode)
        }
    }
  
    private var newNevus: Nevus?
    {
        didSet
        {
            if let old = oldValue, let node = old.node
            {
                node.removeFromParentNode()
                old.bodyNode?.remove(nevus: old)
                neviByNode.removeValue(forKey: node)
                nevi.remove(old)
            }
          
            guard let nevus = newNevus, let node = nevus.node else {
                return
            }
          
            nevus.state = .newlyAdded
          
            neviRootNode.addChildNode(node)
            nevus.bodyNode?.add(nevus: nevus)

            let lookAt = SCNLookAtConstraint(target: cameraNode)
          
//            let zoomTransform = { (node: SCNNode, matrix: SCNMatrix4) -> SCNMatrix4 in
//                let pos = node.convertPosition(SCNVector3Zero, to: self.cameraNode)
//                let dx = pos.x
//                let dy = pos.y
//                let dz = pos.z
//                let dist = sqrt(dx * dx + dy * dy + dz * dz)
//              
//                let tg = 10 / dist
//                let angularSize = atan(tg)
//                let s: Float = 1.0 / angularSize
//              
//                return SCNMatrix4Scale(matrix, s, s, s)
//            }
//          
//            let zoom = SCNTransformConstraint(inWorldSpace: false, with: zoomTransform)
          
            node.constraints = [ lookAt ] //, zoom ]

            nevi.insert(nevus)
            neviByNode[node] = nevus
          
            delegate?.bodyView(self, nevusAdded: nevus)
        }
    }
  
    var moles: NSArray?
    {
        didSet
        {
            removeAllNevi()
          
            guard let moles = moles else {
                return
            }
          
            for m in moles
            {
                guard let m = m as? [String:Any],
                      let id = m["id"] as? String,
                      let anatomicalSite = m["anatomicalSite"] as? String,
                      let faceIndex = m["faceIndex"] as? Int,
                      let positionX = m["positionX"] as? Float,
                      let positionY = m["positionY"] as? Float,
                      let bodyNode = bodyNodesByName[anatomicalSite]
                else {
                    return
                }
              
                let nevus = Nevus(id: id, bodyNode: bodyNode, faceIndex: faceIndex,
                                  coord: SCNVector3Make(positionX, positionY, 0),
                                  state: .newlyAdded)
              
                neviRootNode.addChildNode(nevus.node)
                bodyNode.add(nevus: nevus)

                let lookAt = SCNLookAtConstraint(target: cameraNode)
                nevus.node.constraints = [ lookAt ]

                nevi.insert(nevus)
                neviByNode[nevus.node] = nevus
              
                if let bodyNode = selectedBodyNodeHI {
                    showNevi(for: bodyNode)
                }
            }
        }
    }
  
    private func updateModel()
    {}
  
    private let backgroundView = RadialGradientView()
    private let sceneView = SCNView()
    private let controlsView = ControlsView()
    private let bodyNodeLabel = UILabel()
    
    private let scene = SCNScene()
    private let commonRootNode = SCNNode()
    private var bodyRootNode: SCNNode!
    private let neviRootNode = SCNNode()
    
    private let camera = SCNCamera()
    private let cameraNode = SCNNode()
    private var cameraTargets: [ControlsView.Item:CameraTarget] = [:]
    private var bodyNodesControlViewItems: [BodyNode:ControlsView.Item] = [:]
    
    private var bodys: [Body] = []
    private var body: Body?
    
    private var rootBodyNode: BodyNode!
    
    private var selectedBodyNodeLO: BodyNode! {
        didSet {
            updateBodyNodeLabel()
            let name = selectedBodyNodeLO?.displayName ?? "none"
            delegate?.bodyView(self, bodyNodeSelected: name)
        }
    }
    
    private var selectedBodyNodeHI: BodyNode? {
        didSet {
            updateBodyNodeLabel()
            showNevi(for: selectedBodyNodeHI)
            newNevus = nil
//            let name = selectedBodyNodeHI?.displayName ?? "none"
//            delegate?.bodyView(self, bodyNodeSelected: name)
        }
    }
    
    private var bodyNodesByNode = [SCNNode:BodyNode]()
    private var bodyNodesByName = [String:BodyNode]()
    
    private var nevi = Set<Nevus>()
    private var neviByNode = [SCNNode:Nevus]()
    
    private var selectedNevus: Nevus? {
        didSet {
            showContinueToCloseUpPhotoButton = (selectedNevus != nil)
        }
    }
  
    private let defaultFov = 60.0
  
    private var lastPanCoord: CGPoint?
    private var lastPinchScale: Float?
    
    private var rotation: SCNMatrix4 = SCNMatrix4Identity
    private var scale: SCNMatrix4 = SCNMatrix4Identity
    
    private var head: BodyNode!
    private var face: BodyNode!
    private var occipitalScalp: BodyNode!

    private var trunk: BodyNode!
    private var upperChestR: BodyNode!
    private var upperChestL: BodyNode!
    private var upperBackR: BodyNode!
    private var upperBackL: BodyNode!
    private var upperAbdomenR: BodyNode!
    private var upperAbdomenL: BodyNode!
    private var lowerAbdomenR: BodyNode!
    private var lowerAbdomenL: BodyNode!
    private var lowerBackR: BodyNode!
    private var lowerBackL: BodyNode!
    private var buttockR: BodyNode!
    private var buttockL: BodyNode!
    
    private var armR: BodyNode!
    private var posteriorShoulderR: BodyNode!
    private var dorsalHandR: BodyNode!
    private var anteriorUpperArmR: BodyNode!
    private var posteriorForearmR: BodyNode!
    private var anteriorForearmR: BodyNode!
    private var elbowR: BodyNode!
    private var anteriorShoulderR: BodyNode!
    private var antecubitalFossaR: BodyNode!
    private var posteriorUpperArmR: BodyNode!
    private var palmR: BodyNode!
    
    private var armL: BodyNode!
    private var posteriorShoulderL: BodyNode!
    private var dorsalHandL: BodyNode!
    private var anteriorUpperArmL: BodyNode!
    private var posteriorForearmL: BodyNode!
    private var anteriorForearmL: BodyNode!
    private var elbowL: BodyNode!
    private var anteriorShoulderL: BodyNode!
    private var antecubitalFossaL: BodyNode!
    private var posteriorUpperArmL: BodyNode!
    private var palmL: BodyNode!
    
    private var legR: BodyNode!
    private var anteriorThighR: BodyNode!
    private var posteriorThighR: BodyNode!
    private var popitealFossaR: BodyNode!
    private var kneeR: BodyNode!
    private var proximalLowerLegR: BodyNode!
    private var proximalCalfR: BodyNode!
    private var distalLowerFootR: BodyNode!
    private var distalCalfR: BodyNode!
    private var dorsalFootR: BodyNode!
    private var heelR: BodyNode!
    
    private var legL: BodyNode!
    private var anteriorThighL: BodyNode!
    private var posteriorThighL: BodyNode!
    private var popitealFossaL: BodyNode!
    private var kneeL: BodyNode!
    private var proximalLowerLegL: BodyNode!
    private var proximalCalfL: BodyNode!
    private var distalLowerFootL: BodyNode!
    private var distalCalfL: BodyNode!
    private var dorsalFootL: BodyNode!
    private var heelL: BodyNode!
    
    private let continueToCloseUpPhotoButton = UIButton()
    private let continueToCloseUpPhotoButtonHeight = 50.0
    private var continueToCloseUpPhotoButtonBottomOffset: Constraint?
    
// MARK: - Setup
    
    private func setupNodes()
    {
        try! loadBody()
        
        scene.rootNode.addChildNode(commonRootNode)
        commonRootNode.addChildNode(bodyRootNode)
        commonRootNode.addChildNode(neviRootNode)
        
        let s = 0.275
        commonRootNode.scale = SCNVector3(s, s, s)
        
        neviRootNode.transform = bodyRootNode.transform
    }
    
    private func processBodyNodesRecursively(bodyNode: BodyNode)
    {
        if let name = bodyNode.name {
            bodyNodesByName[name] = bodyNode
        }
        
        bodyNodesByNode[bodyNode.node] = bodyNode
        
        bodyNode.children.forEach {
            processBodyNodesRecursively(bodyNode: $0)
        }
    }
    
    private func loadBody() throws
    {
        guard let bodyScene = SCNScene(named: "art.scnassets/Body.scn") else {
            throw LoadError.sceneNotFound
        }

        bodyRootNode = bodyScene.rootNode.childNode(withName: "Whole Body", recursively: false)
        
        guard let bodyRootNode = bodyRootNode else {
            throw LoadError.invalidScene
        }
        
        rootBodyNode = BodyNode(bodyRootNode)
        
        guard let rootBodyNode = rootBodyNode else {
            throw LoadError.invalidScene
        }
        
        processBodyNodesRecursively(bodyNode: rootBodyNode)
        
        rootBodyNode.children.forEach {
            $0.flatten = true
        }
    }
    
    private func setupSpecialNodes()
    {
        head = bodyNodesByName["Head"]
        face = bodyNodesByName["Face"]
        occipitalScalp = bodyNodesByName["Occipital Scalp"]
        
        trunk = bodyNodesByName["Trunk"]
        upperChestR = bodyNodesByName["Upper Chest R"]
        upperChestL = bodyNodesByName["Upper Chest L"]
        upperBackR = bodyNodesByName["Upper Back R"]
        upperBackL = bodyNodesByName["Upper Back L"]
        upperAbdomenR = bodyNodesByName["Upper Abdomen R"]
        upperAbdomenL = bodyNodesByName["Upper Abdomen L"]
        lowerAbdomenR = bodyNodesByName["Lower Abdomen R"]
        lowerAbdomenL = bodyNodesByName["Lower Abdomen L"]
        lowerBackR = bodyNodesByName["Lower Back R"]
        lowerBackL = bodyNodesByName["Lower Back L"]
        buttockR = bodyNodesByName["Buttock R"]
        buttockL = bodyNodesByName["Buttock L"]
        
        armR = bodyNodesByName["Arm R"]
        posteriorShoulderR = bodyNodesByName["Posterior Shoulder R"]
        dorsalHandR = bodyNodesByName["Dorsal Hand R"]
        anteriorUpperArmR = bodyNodesByName["Anterior Upper Arm R"]
        posteriorForearmR = bodyNodesByName["Posterior Forearm R"]
        anteriorForearmR = bodyNodesByName["Anterior Forearm R"]
        elbowR = bodyNodesByName["Elbow R"]
        anteriorShoulderR = bodyNodesByName["Anterior Shoulder R"]
        antecubitalFossaR = bodyNodesByName["Antecubital Fossa R"]
        posteriorUpperArmR = bodyNodesByName["Posterior Upper Arm R"]
        palmR = bodyNodesByName["Palm R"]
    
        armL = bodyNodesByName["Arm L"]
        posteriorShoulderL = bodyNodesByName["Posterior Shoulder L"]
        dorsalHandL = bodyNodesByName["Dorsal Hand L"]
        anteriorUpperArmL = bodyNodesByName["Anterior Upper Arm L"]
        posteriorForearmL = bodyNodesByName["Posterior Forearm L"]
        anteriorForearmL = bodyNodesByName["Anterior Forearm L"]
        elbowL = bodyNodesByName["Elbow L"]
        anteriorShoulderL = bodyNodesByName["Anterior Shoulder L"]
        antecubitalFossaL = bodyNodesByName["Antecubital Fossa L"]
        posteriorUpperArmL = bodyNodesByName["Posterior Upper Arm L"]
        palmL = bodyNodesByName["Palm L"]
    
        legR = bodyNodesByName["Leg R"]
        anteriorThighR = bodyNodesByName["Anterior Thigh R"]
        posteriorThighR = bodyNodesByName["Posterior Thigh R"]
        popitealFossaR = bodyNodesByName["Popiteal Fossa R"]
        kneeR = bodyNodesByName["Knee R"]
        proximalLowerLegR = bodyNodesByName["Proximal Lower Leg R"]
        proximalCalfR = bodyNodesByName["Proximal Calf R"]
        distalLowerFootR = bodyNodesByName["Distal Lower Foot R"]
        distalCalfR = bodyNodesByName["Distal Calf R"]
        dorsalFootR = bodyNodesByName["Dorsal Foot R"]
        heelR = bodyNodesByName["Heel R"]
    
        legL = bodyNodesByName["Leg L"]
        anteriorThighL = bodyNodesByName["Anterior Thigh L"]
        posteriorThighL = bodyNodesByName["Posterior Thigh L"]
        popitealFossaL = bodyNodesByName["Popiteal Fossa L"]
        kneeL = bodyNodesByName["Knee L"]
        proximalLowerLegL = bodyNodesByName["Proximal Lower Leg L"]
        proximalCalfL = bodyNodesByName["Proximal Calf L"]
        distalLowerFootL = bodyNodesByName["Distal Lower Foot L"]
        distalCalfL = bodyNodesByName["Distal Calf L"]
        dorsalFootL = bodyNodesByName["Dorsal Foot L"]
        heelL = bodyNodesByName["Heel L"]
    }
    
    private func setupDisplayNames()
    {
        head.displayName = "Head"
        face.displayName = "Face"
        occipitalScalp.displayName = "Occipital Scalp"
        
        trunk.displayName = "Trunk"
        upperChestR.displayName = "Right Upper Chest"
        upperChestL.displayName = "Left Upper Chest"
        upperBackR.displayName = "Right Upper Back"
        upperBackL.displayName = "Left Upper Back"
        upperAbdomenR.displayName = "Right Upper Abdomen"
        upperAbdomenL.displayName = "Left Upper Abdomen"
        lowerAbdomenR.displayName = "Right Lower Abdomen"
        lowerAbdomenL.displayName = "Left Lower Abdomen"
        lowerBackR.displayName = "Right Lower Back"
        lowerBackL.displayName = "Left Lower Back"
        buttockR.displayName = "Right Buttock"
        buttockL.displayName = "Left Buttock"
        
        armR.displayName = "Right Arm"
        posteriorShoulderR.displayName = "Right Posterior Shoulder"
        dorsalHandR.displayName = "Right Dorsal Hand"
        anteriorUpperArmR.displayName = "Right Anterior Upper Arm"
        posteriorForearmR.displayName = "Right Posterior Forearm"
        anteriorForearmR.displayName = "Right Anterior Forearm"
        elbowR.displayName = "Right Elbow"
        anteriorShoulderR.displayName = "Right Anterior Shoulder"
        antecubitalFossaR.displayName = "Right Antecubital Fossa"
        posteriorUpperArmR.displayName = "Right Posterior Upper Arm"
        palmR.displayName = "Right Palm"
        
        armL.displayName = "Left Arm"
        posteriorShoulderL.displayName = "Left Posterior Shoulder"
        dorsalHandL.displayName = "Left Dorsal Hand"
        anteriorUpperArmL.displayName = "Left Anterior Upper Arm"
        posteriorForearmL.displayName = "Left Posterior Forearm"
        anteriorForearmL.displayName = "Left Anterior Forearm"
        elbowL.displayName = "Left Elbow"
        anteriorShoulderL.displayName = "Left Anterior Shoulder"
        antecubitalFossaL.displayName = "Left Antecubital Fossa"
        posteriorUpperArmL.displayName = "Left Posterior Upper Arm"
        palmL.displayName = "Left Palm"
        
        legR.displayName = "Right Leg"
        anteriorThighR.displayName = "Right Anterior Thigh"
        posteriorThighR.displayName = "Right Posterior Thigh"
        popitealFossaR.displayName = "Right Popiteal Fossa"
        kneeR.displayName = "Right Knee"
        proximalLowerLegR.displayName = "Right Proximal Lower Leg"
        proximalCalfR.displayName = "Right Proximal Calf"
        distalLowerFootR.displayName = "Right Distal Lower Foot"
        distalCalfR.displayName = "Right Distal Calf"
        dorsalFootR.displayName = "Right Dorsal Foot"
        heelR.displayName = "Right Heel"
        
        legL.displayName = "Left Leg"
        anteriorThighL.displayName = "Left Anterior Thigh"
        posteriorThighL.displayName = "Left Posterior Thigh"
        popitealFossaL.displayName = "Left Popiteal Fossa"
        kneeL.displayName = "Left Knee"
        proximalLowerLegL.displayName = "Left Proximal Lower Leg"
        proximalCalfL.displayName = "Left Proximal Calf"
        distalLowerFootL.displayName = "Left Distal Lower Foot"
        distalCalfL.displayName = "Left Distal Calf"
        dorsalFootL.displayName = "Left Dorsal Foot"
        heelL.displayName = "Left Heel"
    }
    
    private func setupCamera()
    {
//        camera.automaticallyAdjustsZRange = true
//        camera.usesOrthographicProjection = true
//        camera.orthographicScale = 5
        camera.zNear = 0.1
        camera.yFov = 70

        cameraNode.camera = camera
        scene.rootNode.addChildNode(cameraNode)

        lookAtWholeBody(front: true)
    }
    
    private func setupCameraTargets()
    {
        cameraTargets[.body] = .front
        cameraTargets[.head] = .bodyNode(head)
        cameraTargets[.armR] = .bodyNode(armR)
        cameraTargets[.armL] = .bodyNode(armL)
        cameraTargets[.legR] = .bodyNode(legR)
        cameraTargets[.legL] = .bodyNode(legL)
        cameraTargets[.back] = .back
    }
    
    private func setupBodyNodesControlViewItems()
    {
        bodyNodesControlViewItems[rootBodyNode] = ControlsView.Item.body
        bodyNodesControlViewItems[head] = ControlsView.Item.head
        bodyNodesControlViewItems[armR] = ControlsView.Item.armR
        bodyNodesControlViewItems[armL] = ControlsView.Item.armL
        bodyNodesControlViewItems[legR] = ControlsView.Item.legR
        bodyNodesControlViewItems[legL] = ControlsView.Item.legL
    }
    
    private func setupRootBodyNodeCameraMotion(visualize: Bool = false)
    {
        var bodyCenterLocal = rootBodyNode.node.boundingSphere.center
        bodyCenterLocal.x = 0
      
        let bodyCenterWorld = rootBodyNode.node.convertPosition(bodyCenterLocal, to: scene.rootNode)
      
        rootBodyNode.cameraMotion =
            EllipsoidalMotionWithFlexibleFocusPoint(center: SCNVector3ToGLKVector3(bodyCenterWorld),
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
      
        if visualize, let repr = rootBodyNode.cameraMotion?.getRepresentationNode(z: 5, nx: 100, ny: 100, color: .black) {
            scene.rootNode.addChildNode(repr)
        }
    }
    
    private func setSphericalMotion(bodyNode: BodyNode,
                                    center: GLKVector3,
                                    minR: Float, maxR: Float, r: Float,
                                    minTheta: Float = 0.1 * Float.pi,
                                    maxTheta: Float = 0.9 * Float.pi,
                                    visualize: Bool = false)
    {
        var center = bodyNode.node.boundingSphere.center
        center.x = 0
        
        let pos = bodyNode.node.convertPosition(center, to: scene.rootNode)

        bodyNode.cameraMotion =
            SphericalMotion(center: SCNVector3ToGLKVector3(pos),
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
            scene.rootNode.addChildNode(repr)
        }
    }
  
    private func setupArmCameraMotion(bodyNode: BodyNode,
                                      origin: GLKVector3,
                                      axisZ: GLKVector3,
                                      axisY: GLKVector3,
                                      targetPoints: [(x: Float, pos: GLKVector3)],
                                      showSurface: Bool = false,
                                      showTargets: Bool = false)
    {
        let axisY_proj_on_axisZ = GLKVector3DotProduct(axisZ, axisY) / GLKVector3Length(axisZ)
        let axisY = GLKVector3Subtract(axisY, GLKVector3MultiplyScalar(GLKVector3Normalize(axisZ), axisY_proj_on_axisZ))
      
        let dot = GLKVector3DotProduct(axisZ, axisY)
        assert(dot < 0.0001)
      
        bodyNode.cameraMotion =
            ArmCameraMotion(origin: origin,
                            axisZ: axisZ,
                            axisY: axisY,
                            cylinderH1: 2,
                            cylinderH2: 2.5,
                            torusR: 4,
                            r: 4,
                            angle: 0.2 * Float.pi / 2,
                            initialFov: defaultFov,
                            minFov: 15,
                            maxFov: 80,
                            targetPoints: targetPoints)
      
        if showSurface, let repr = bodyNode.cameraMotion?.getRepresentationNode(z: 3, nx: 150, ny: 50, color: .black) {
            scene.rootNode.addChildNode(repr)
        }
    
        if showTargets
        {
            for p in targetPoints {
                let ball = BodyView3D.createBall(size: 0.15, color: .red)
                scene.rootNode.addChildNode(ball)
                ball.position = SCNVector3FromGLKVector3(p.pos)
            }
        }
    }
  
    private func setupArmsCameraMotion()
    {
        let rightTargetPoints: [(x: Float, pos: GLKVector3)] = [
            (0.0, GLKVector3Make(-2, 5, -0.5)),
            (1.0, GLKVector3Make(-2.75, 3, -0.65)),
            (2.0, GLKVector3Make(-3.25, 1.8, -0.7)),
            (3.0, GLKVector3Make(-4.1, -0.5, -0.25)),
//            (3.0, GLKVector3Make(-4.0, -1.0, 0)),
            (4.0, GLKVector3Make(-4.25, -1.25, 0))
        ]
      
        setupArmCameraMotion(bodyNode: armR,
                             origin: GLKVector3Make(-2, 5, -0.5),
                             axisZ: GLKVector3Make(-1.25, -3.2, -0.2),
                             axisY: GLKVector3Make(0.25, 0, 1),
                             targetPoints: rightTargetPoints,
                             showSurface: false,
                             showTargets: false)

        let leftTargetPoints = rightTargetPoints.map { p -> (x: Float, pos: GLKVector3) in
            var p = p
            p.pos.x = -p.pos.x
            return p
        }
        
        setupArmCameraMotion(bodyNode: armL,
                             origin: GLKVector3Make(2, 5, -0.5),
                             axisZ: GLKVector3Make(1.25, -3.2, -0.2),
                             axisY: GLKVector3Make(-0.25, 0, 1),
                             targetPoints: leftTargetPoints,
                             showSurface: false,
                             showTargets: false)
    }
  
    private func setupLegCameraMotion(bodyNode: BodyNode,
                                      origin: GLKVector3,
                                      axisZ: GLKVector3,
                                      axisY: GLKVector3,
                                      targetPoints: [(x: Float, pos: GLKVector3)],
                                      showSurface: Bool = false,
                                      showTargets: Bool = false)
    {
        let axisY_proj_on_axisZ = GLKVector3DotProduct(axisZ, axisY) / GLKVector3Length(axisZ)
        let axisY = GLKVector3Subtract(axisY, GLKVector3MultiplyScalar(GLKVector3Normalize(axisZ), axisY_proj_on_axisZ))
      
        let dot = GLKVector3DotProduct(axisZ, axisY)
        assert(dot < 0.0001)
      
        bodyNode.cameraMotion =
            LegCameraMotion(origin: origin,
                            axisZ: axisZ,
                            axisY: axisY,
                            cylinderH: 4.5,
                            torusR: 4,
                            r: 4,
                            angle: (2 / 3) * Float.pi / 2,
                            initialFov: defaultFov,
                            minFov: 15,
                            maxFov: 80,
                            targetPoints: targetPoints)
      
        if showSurface, let repr = bodyNode.cameraMotion?.getRepresentationNode(z: 3, nx: 200, ny: 100, color: .black) {
            scene.rootNode.addChildNode(repr)
        }
    
        if showTargets
        {
            for p in targetPoints {
                let ball = BodyView3D.createBall(size: 0.15, color: .red)
                scene.rootNode.addChildNode(ball)
                ball.position = SCNVector3FromGLKVector3(p.pos)
            }
        }
    }
  
    private func setupLegsCameraMotion()
    {
        let rightLegPoints: [(x: Float, pos: GLKVector3)] = [
            (0.0, GLKVector3Make(-1, -2, -0.25)),
            (1.0, GLKVector3Make(-1.15, -5.5, -0.3)),
            (1.75, GLKVector3Make(-1.3, -10.25, -0.5)),
            (2.0, GLKVector3Make(-1.4, -10.4, 0.15)),
            (3.0, GLKVector3Make(-1.5, -10.5, 0.75))
        ]
      
        setupLegCameraMotion(bodyNode: legR,
                             origin: GLKVector3Make(-1, -2, -0.25),
                             axisZ: GLKVector3Make(-0.025, -1, -0.1),
                             axisY: GLKVector3Make(-0.25, 0, 1),
                             targetPoints: rightLegPoints,
                             showTargets: false)

        let leftLegPoints = rightLegPoints.map { p -> (x: Float, pos: GLKVector3) in
            var p = p
            p.pos.x = -p.pos.x
            return p
        }
        
        setupLegCameraMotion(bodyNode: legL,
                             origin: GLKVector3Make(1, -2, -0.25),
                             axisZ: GLKVector3Make(0.025, -1, -0.1),
                             axisY: GLKVector3Make(0.25, 0, 1),
                             targetPoints: leftLegPoints,
                             showTargets: false)
    }
  
    private func setupHeadCameraMotion()
    {
        let headCenterLocal = head.node.boundingSphere.center
        let headCenterWorld = head.node.convertPosition(headCenterLocal, to: scene.rootNode)
        
        setSphericalMotion(bodyNode: head,
                           center: SCNVector3ToGLKVector3(headCenterWorld),
                           minR: 3, maxR: 8, r: 5,
                           minTheta: 0.25 * Float.pi,
                           maxTheta: 0.7 * Float.pi)
    }
  
    private func setupCameraMotion()
    {
        setupRootBodyNodeCameraMotion()
        setupHeadCameraMotion()
        setupArmsCameraMotion()
        setupLegsCameraMotion()
    }
    
    private let cameraTargetDebugPoint: SCNNode =
        BodyView3D.createBall(size: 0.15, color: .green)

    private func setupCameraTargetDebugPoint()
    {
        scene.rootNode.addChildNode(cameraTargetDebugPoint)
        cameraTargetDebugPoint.isHidden = true
    }
    
    private func updateCameraTargetDebugPoint(_ motion: CameraMotion)
    {
        cameraTargetDebugPoint.position = SCNVector3FromGLKVector3(motion.target)
    }
    
    private static func createBall(size: Float, color: UIColor) -> SCNNode
    {
        let m = SCNMaterial()
        m.lightingModel = .blinn
        m.diffuse.contents = color

        let g = SCNSphere(radius: CGFloat(size))
        g.materials = [ m ]
        
        return SCNNode(geometry: g)
    }
    
    private func setupLights()
    {
//        let flux: CGFloat = 500
//        
//        let lightDescriptions = [
//            (flux: flux, pos: SCNVector3(0, 20, 20)),
//            (flux: flux, pos: SCNVector3(0, 20, -20)),
//            (flux: flux, pos: SCNVector3(50, 20, 0)),
//            (flux: flux, pos: SCNVector3(-50, 20, 0)),
//            (flux: flux, pos: SCNVector3(0, 200, 0)),
//            (flux: flux, pos: SCNVector3(0, -125, 0))
//        ]
//        
//        for descr in lightDescriptions
//        {
//            let light = SCNLight()
//            light.type = .omni
//            light.intensity = flux
//
//            let node = SCNNode()
//            node.light = light
//            node.position = descr.pos
//            scene.rootNode.addChildNode(node)
//        }
      
        let dirLight = SCNLight()
        dirLight.type = .directional
        dirLight.intensity = 750
        cameraNode.light = dirLight
    }

    private func setupViews()
    {
        addSubview(backgroundView)
        addSubview(sceneView)
        addSubview(controlsView)
        addSubview(continueToCloseUpPhotoButton)
        insertSubview(bodyNodeLabel, belowSubview: controlsView)

        backgroundColor = UIColor(red: 172.0 / 255.0, green: 182.0 / 255.0, blue: 190.0 / 255.0, alpha: 1)
      
        backgroundView.colors = [
            UIColor(white: 1, alpha: 1),
            UIColor(white: 1, alpha: 0.25),
            UIColor(white: 1, alpha: 0),
            UIColor(white: 1, alpha: 0),
        ]
      
        backgroundView.locations = [ 0, 0.35, 0.75, 1 ]
//        backgroundView.isHidden = true
      
        controlsView.delegate = self
        controlsView.backgroundColor = UIColor(red: 125.0 / 255.0, green: 147.0 / 255.0, blue: 170.0 / 255.0, alpha: 0.34)
        controlsView.layer.cornerRadius = 0
        
        continueToCloseUpPhotoButton.setTitle("Continue to close-up photo", for: .normal)
        continueToCloseUpPhotoButton.setTitleColor(.white, for: .normal)
        continueToCloseUpPhotoButton.titleLabel?.font = .systemFont(ofSize: 16)
        continueToCloseUpPhotoButton.showsTouchWhenHighlighted = true
        continueToCloseUpPhotoButton.backgroundColor = UIColor(red: 1, green: 29.0 / 255.0, blue: 112.0 / 255.0, alpha: 1)
        continueToCloseUpPhotoButton.addTarget(self, action: #selector(didTapContinueToCloseUpPhoto(_:)), for: .touchUpInside)
        continueToCloseUpPhotoButton.alpha = 0
        
        bodyNodeLabel.backgroundColor = UIColor(white: 1, alpha: 0.5)
        bodyNodeLabel.textColor = UIColor(white: 0.45, alpha: 1)
        bodyNodeLabel.font = .systemFont(ofSize: 14)
        bodyNodeLabel.textAlignment = .center
      
        backgroundView.snp.makeConstraints { make in
            make.edges.equalToSuperview()
        }
      
        controlsView.snp.makeConstraints { make in
            make.left.right.top.equalToSuperview()
        }
        
        sceneView.snp.makeConstraints { make in
            make.left.right.bottom.equalToSuperview()
            make.top.equalTo(controlsView.snp.bottom)
        }
        
        bodyNodeLabel.snp.makeConstraints { make in
            make.left.right.equalToSuperview()
            make.top.equalTo(controlsView.snp.bottom)
            make.height.equalTo(22)
        }
        
//        continueToCloseUpPhotoButton.snp.makeConstraints { make in
//            make.left.right.equalToSuperview()
//            make.height.equalTo(continueToCloseUpPhotoButtonHeight)
////            continueToCloseUpPhotoButtonBottomOffset = make.bottom.equalToSuperview().offset(continueToCloseUpPhotoButtonHeight).constraint
//        }
        
//        updateContinueToCloseUpPhotoButton()
        
        sceneView.scene = scene
        sceneView.delegate = self
        sceneView.backgroundColor = UIColor(white: 1, alpha: 0)
        sceneView.antialiasingMode = .multisampling4X
    }

    private func setupGestureRecognizers()
    {
        let pan = UIPanGestureRecognizer(target: self, action: #selector(handlePan(_:)))
        sceneView.addGestureRecognizer(pan)
        
        let tap = UITapGestureRecognizer(target: self, action: #selector(handleTap(_:)))
        sceneView.addGestureRecognizer(tap)
        
        let pinch = UIPinchGestureRecognizer(target: self, action: #selector(handlePinch(_:)))
        sceneView.addGestureRecognizer(pinch)
    }

    private func setup()
    {
        setupViews()
        setupNodes()
        setupSpecialNodes()
        setupDisplayNames()
        setupCamera()
        setupCameraTargets()
        setupBodyNodesControlViewItems()
        setupCameraMotion()
        setupLights()
        setupGestureRecognizers()
//        setupDebugPoints()
        setupCameraTargetDebugPoint()
        lookAtCameraTarget(.front)
    }

    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        setup()
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setup()
    }

// MARK: Close-up photo button

    private var showContinueToCloseUpPhotoButton: Bool = false {
        didSet {
//            updateContinueToCloseUpPhotoButton()
        }
    }

    private func updateContinueToCloseUpPhotoButton()
    {
        let duration = (showContinueToCloseUpPhotoButton ? 0.5 : 0.35)
        let alpha: CGFloat = (showContinueToCloseUpPhotoButton ? 1 : 0)
        let y = (showContinueToCloseUpPhotoButton ? 0 : continueToCloseUpPhotoButtonHeight)
        
        UIView.animate(withDuration: duration) {
            self.continueToCloseUpPhotoButtonBottomOffset?.update(offset: y)
            self.layoutIfNeeded()
            self.continueToCloseUpPhotoButton.alpha = alpha
        }
    }

    @objc private func didTapContinueToCloseUpPhoto(_ sender: UIButton)
    {
    }

// MARK: Look at
    
    private func lookAtBodyNode(_ bodyNode: BodyNode)
    {
        highlightBodyNode(bodyNode)
        
        if let motion = bodyNode.cameraMotion
        {
            let fov = Double(motion.initialFov ?? defaultFov)
            camera.yFov = fov
          
            motion.reset()
            motion.updateNode(cameraNode)
            updateCameraTargetDebugPoint(motion)
        }
    }
    
    private func lookAtWholeBody(front: Bool)
    {
        highlightBodyNode(nil)
        
        guard let motion = rootBodyNode.cameraMotion as? SphericalMotion else {
            return
        }
      
        camera.yFov = defaultFov
      
        motion.initialCoord.phi = (front ? 0.5 : -0.5) * Float.pi
        motion.reset()
        motion.updateNode(cameraNode)
        updateCameraTargetDebugPoint(motion)
    }

    private func lookAtCameraTarget(_ target: CameraTarget)
    {
        switch target
        {
            case .front:
                guard selectedBodyNodeLO != rootBodyNode else {
                    return
                }
                
                lookAtWholeBody(front: true)
                highlightBodyNode(nil)
                selectedBodyNodeLO = rootBodyNode
                controlsView.selectedItem = .body
            
            case .back:
                guard selectedBodyNodeLO != rootBodyNode else {
                    return
                }
                
                lookAtWholeBody(front: false)
                highlightBodyNode(nil)
                selectedBodyNodeLO = rootBodyNode
                controlsView.selectedItem = .body
            
            case .bodyNode(let bodyNode):
                guard selectedBodyNodeLO != bodyNode else {
                    return
                }
                
                lookAtBodyNode(bodyNode)
                highlightBodyNode(bodyNode)
                selectedBodyNodeLO = bodyNode
                
                if let item = bodyNodesControlViewItems[bodyNode] {
                    controlsView.selectedItem = item
                }
        }
        
        selectedBodyNodeHI?.selected = false
        selectedBodyNodeHI = nil
        
//        selectedNevus?.selected = false
        selectedNevus?.state = .normal
        selectedNevus = nil
      
        newNevus?.state = .normal
    }
    
    private func highlightBodyNode(_ bodyNode: BodyNode?)
    {
        if let bodyNode = bodyNode
        {
            bodyNode.opacity = 1
//            bodyNode.node.isHidden = false
            makeAllNodeTransparentExceptNode(bodyNode)
        }
        else
        {
            makeAllNodesOpaque()
        }
    }

    private func makeAllNodeTransparentExceptNode(_ node: BodyNode)
    {
        rootBodyNode.children.filter { $0 != node }.forEach {
            $0.opacity = 0.02
//            $0.node.isHidden = true
        }
    }

    private func makeAllNodesOpaque()
    {
        rootBodyNode.children.forEach {
            $0.opacity = 1
//            $0.node.isHidden = false
        }
    }

    private func findControlsViewItem(_ bodyNode: BodyNode) -> ControlsView.Item?
    {
        if let item = bodyNodesControlViewItems[bodyNode] {
            return item
        }
        
        guard let parent = bodyNode.parent else {
            return nil
        }
        
        return findControlsViewItem(parent)
    }

// MARK: - Handling Hit

    private func zipBodyNodesAndDistanceToParentInHitTestResults(_ hitResults: [SCNHitTestResult], relativeTo parent: BodyNode)
        -> [(hitTestResult: SCNHitTestResult, bodyNode: BodyNode, distance: Int)]?
    {
        var arr = [(SCNHitTestResult, BodyNode, Int)]()
        
        for hit in hitResults
        {
            let node = hit.node
            
            guard let bodyNode = bodyNodesByNode[node],
                  let dist = bodyNode.getDistanceToParent(parent)
            else {
                continue
            }
            
            arr.append((hit, bodyNode, dist))
        }
        
        return arr
    }
    
    private func findFarthestChildNodeInHitTestResults(_ hitResults: [SCNHitTestResult], relativeTo parent: BodyNode)
        -> (hitTestResult: SCNHitTestResult, bodyNode: BodyNode)?
    {
        if let r = zipBodyNodesAndDistanceToParentInHitTestResults(hitResults, relativeTo: parent)?.sorted(by: {
            return $0.distance > $1.distance
        }).first {
            return (r.hitTestResult, r.bodyNode)
        }
        
        return nil
    }

    private func findNearestChildNodeInHitTestResults(_ hitResults: [SCNHitTestResult], relativeTo parent: BodyNode)
        -> (hitTestResult: SCNHitTestResult, bodyNode: BodyNode)?
    {
        if let r = zipBodyNodesAndDistanceToParentInHitTestResults(hitResults, relativeTo: parent)?.sorted(by: {
            return $0.distance < $1.distance
        }).first {
            return (r.hitTestResult, r.bodyNode)
        }
        
        return nil
    }
  
    private func removeAllNevi()
    {
        for nevus in nevi
        {
            nevus.node.removeFromParentNode()
            nevus.bodyNode?.remove(nevus: nevus)
            neviByNode.removeValue(forKey: nevus.node)
        }
      
        nevi.removeAll()
    }
  
    private func addNevus(bodyNode: BodyNode, hitTestResult: SCNHitTestResult)
    {
        let faceIndex = hitTestResult.faceIndex
        let coord = hitTestResult.localCoordinates
        
//        debugPrint(">> Geometry index: \(hitTestResult.geometryIndex)");
//        debugPrint(">> Face index: \(faceIndex)");
//        debugPrint(">> Coord: x=\(coord.x), y=\(coord.y), z=\(coord.z)");
      
        guard let geometry = bodyNode.node.geometry else {
            return
        }
        
        let geometryElements = geometry.geometryElements
        
        var normalSource: SCNGeometrySource?
        var uvSource: SCNGeometrySource?
        
        for src in geometry.geometrySources
        {
//                debugPrint(">> Geometry source: semantic=\(src.semantic) count=\(src.vectorCount)")

            if src.semantic == .normal {
                normalSource = src
            }
            
            if src.semantic == .texcoord {
                uvSource = src
            }
        }
        
//        for e in geometryElements {
//            debugPrint(">> Geometry element: type=\(e.primitiveType), count=\(e.primitiveCount), bytesPerIndex=\(e.bytesPerIndex)")
//        }
      
// Obtain vertices from face

        let geometryElement = geometryElements.first!
        let geometryElementsBytesPerIndex = geometryElement.bytesPerIndex
        
        var ijk = [UInt16](repeating: 0, count: 3)
        let start = 3 * faceIndex * geometryElementsBytesPerIndex
        let size = 3 * geometryElementsBytesPerIndex
        let range = Range(uncheckedBounds: (start, start + size))
        
        UnsafeMutablePointer(mutating: ijk).withMemoryRebound(to: UInt8.self, capacity: size) { (ptr: UnsafeMutablePointer<UInt8>) in
            geometryElement.data.copyBytes(to: ptr, from: range)
        }
        
//        debugPrint(">> ijk = \(ijk[0]) \(ijk[1]) \(ijk[2])")

// Obtain tex coords
    
        if let uvSource = uvSource
        {
            assert(uvSource.usesFloatComponents == true)
            assert(uvSource.bytesPerComponent == 4)
            assert(uvSource.componentsPerVector == 2)
            
            for i in 0..<3
            {
                var uv = [Float](repeating: 0, count: 2)
                let start = uvSource.dataOffset + Int(ijk[i]) * uvSource.dataStride
                let size = uv.count * MemoryLayout<Float>.size
                let range = Range(uncheckedBounds: (start, start + size))
                
                UnsafeMutablePointer(mutating: uv).withMemoryRebound(to: UInt8.self, capacity: size) { (ptr: UnsafeMutablePointer<UInt8>) in
                    uvSource.data.copyBytes(to: ptr, from: range)
                }
                
//                debugPrint(">> uv[\(i)]: \(uv[0]) \(uv[1])")
            }
        }
        
        var normals = [SCNVector3]()
        
        if let normalSource = normalSource
        {
            assert(normalSource.usesFloatComponents == true)
            assert(normalSource.bytesPerComponent == 4)
            assert(normalSource.componentsPerVector == 3)
            
//            debugPrint(">> Normals vectorCount = \(normalSource.vectorCount)")
          
            for i in 0..<3
            {
                var normal = [Float](repeating: 0, count: 3)
                let start = normalSource.dataOffset + Int(ijk[i]) * normalSource.dataStride
                let size = normal.count * MemoryLayout<Float>.size
                let range = Range(uncheckedBounds: (start, start + size))
                
                UnsafeMutablePointer(mutating: normal).withMemoryRebound(to: UInt8.self, capacity: size) { (ptr: UnsafeMutablePointer<UInt8>) in
                    normalSource.data.copyBytes(to: ptr, from: range)
                }
                
                normals.append(SCNVector3Make(normal[0], normal[1], normal[2]))
                
//                debugPrint(">> normal[\(i)]: \(normal[0]) \(normal[1]) \(normal[2])")
            }
        }
        
// Add nevus

        let nevus = Nevus(bodyNode: bodyNode,
                          faceIndex: faceIndex,
                          coord: coord,
                          direction: normals.first!,
                          appearance: .texturedRect,
                          alwaysVisible: true)

        newNevus = nevus
      
//        neviRootNode.addChildNode(nevus.node)
//        bodyNode.add(nevus: nevus)
//
//        let lookAt = SCNLookAtConstraint(target: cameraNode)
//        nevus.node.constraints = [ lookAt ]
//
//        nevi.insert(nevus)
//        neviByNode[nevus.node] = nevus
//      
//        delegate?.bodyView(self, nevusAdded: nevus)
    }
    
    private func handleHitHigh(_ bodyNode: BodyNode, _ hitTestResult: SCNHitTestResult, _ didSelectNevus: Bool)
    {
        if selectedBodyNodeHI == bodyNode
        {
            if !didSelectNevus
            {
                addNevus(bodyNode: bodyNode, hitTestResult: hitTestResult)
                
//                selectedNevus?.selected = false
                selectedNevus?.state = .normal
                selectedNevus = nil
            }
        }
        else
        {
            selectedBodyNodeHI?.selected = false
            bodyNode.selected = true
            selectedBodyNodeHI = bodyNode
          
            let name = bodyNode.displayName ?? "none"
            delegate?.bodyView(self, bodyNodeSelected: name)
        }
    }

    private func nevusHitTest(_ hitTestResults: [SCNHitTestResult]) -> Nevus?
    {
        let nevusHitResult = hitTestResults.first(where: {
            $0.node.parent == neviRootNode
        })
        
        if let nevusNode = nevusHitResult?.node,
           let nevus = neviByNode[nevusNode],
           selectedNevus != nevus,
           nevus.state != .newlyAdded
        {
//            selectedNevus?.selected = false
            selectedNevus?.state = .normal
          
            selectedNevus = nevus
//            nevus.selected = true
            nevus.state = .selected
          
            return nevus
        }
        
        return nil
    }

// MARK: -

    private func updateBodyNodeLabel(_ bodyNode: BodyNode?)
    {
        guard let bodyNode = bodyNode,
              bodyNode != rootBodyNode
        else
        {
            UIView.animate(withDuration: 0.15) {
                self.bodyNodeLabel.alpha = 0
            }
            bodyNodeLabel.text = nil
            return
        }
        
        UIView.animate(withDuration: 0.25) {
            self.bodyNodeLabel.alpha = 1
        }
        bodyNodeLabel.text = bodyNode.displayName ?? bodyNode.name
    }
    
    private func updateBodyNodeLabel()
    {
        guard let bodyNode = selectedBodyNodeHI else {
            updateBodyNodeLabel(selectedBodyNodeLO)
            return
        }
        
        updateBodyNodeLabel(bodyNode)
    }

// MARK: - Gestures

    @objc private func handlePan(_ pan: UIPanGestureRecognizer)
    {
        guard let motion = selectedBodyNodeLO?.cameraMotion else {
            return
        }
        
        let coord = pan.translation(in: pan.view)

        if pan.state == .began {
            lastPanCoord = coord
        }
        
        let dx = Float(coord.x - (lastPanCoord?.x ?? coord.x))
        let dy = Float(coord.y - (lastPanCoord?.y ?? coord.y))
        
        lastPanCoord = coord
        
        let len = hypot(dx, dy)
        if (len < 0.0001) {
            return;
        }
        
        let translation = GLKVector3Make(dx, dy, 0)
        _ = motion.move(translation)
        motion.updateNode(cameraNode)
        updateCameraTargetDebugPoint(motion)
    }
    
    @objc private func handlePinch(_ pinch: UIPinchGestureRecognizer)
    {
        guard let motion = selectedBodyNodeLO?.cameraMotion else {
            return
        }
        
        let pinchScale = Float(pinch.scale)
        
        if pinch.state == .began {
            lastPinchScale = nil
        }
      
        switch motion.zoomMode
        {
        case .translate:
            let ds = pinchScale - (lastPinchScale ?? pinchScale)
          
            let translation = GLKVector3Make(0, 0, -ds)
            _ = motion.move(translation)
            motion.updateNode(cameraNode)
            updateCameraTargetDebugPoint(motion)
        
        case .fov:
            var fov = camera.yFov * Double((lastPinchScale ?? pinchScale) / pinchScale)
            let minFov = Double(motion.minFov ?? 80.0)
            let maxFov = Double(motion.maxFov ?? 15.0)
            fov = max(min(fov, maxFov), minFov)
            camera.yFov = fov
        }
      
        lastPinchScale = pinchScale
    }
    
    @objc private func handleTap(_ tap: UIGestureRecognizer)
    {
        let p = tap.location(in: sceneView)
        
        let options: [SCNHitTestOption:Any] = [
            .categoryBitMask: 1,
            .ignoreHiddenNodes: false
        ]
        
        let hitResults = sceneView.hitTest(p, options: options)
        
//        debugPrint(">> Hit results: \(hitResults.count)")
      
        hitResults.forEach {
            let name = $0.node.name ?? "-"
//            debugPrint(">>> \(name)")
        }
        
        let selectedNevus = nevusHitTest(hitResults)
        if let nevus = selectedNevus {
            delegate?.bodyView(self, nevusSelected: nevus)
        }
      
        let didSelectNevus = (selectedNevus != nil)
        
        if selectedBodyNodeLO != rootBodyNode,
           let r = findFarthestChildNodeInHitTestResults(hitResults, relativeTo: selectedBodyNodeLO)
        {
            handleHitHigh(r.bodyNode, r.hitTestResult, didSelectNevus)
        }
        else if selectedBodyNodeLO == rootBodyNode,
                let r = findFarthestChildNodeInHitTestResults(hitResults, relativeTo: trunk)
        {
            if let r = findNearestChildNodeInHitTestResults(hitResults, relativeTo: rootBodyNode),
               r.bodyNode.parent != trunk,
               let item = findControlsViewItem(r.bodyNode),
               let target = cameraTargets[item]
            {
                print("\(r.bodyNode.name)")
                controlsView.selectedItem = item
                
//                SCNTransaction.begin()
//                SCNTransaction.animationDuration = 0.5
                lookAtCameraTarget(target)
//                SCNTransaction.commit()
            }
            else
            {
                handleHitHigh(r.bodyNode, r.hitTestResult, didSelectNevus)
            }
        }
        else if selectedBodyNodeLO == rootBodyNode,
                let r = findNearestChildNodeInHitTestResults(hitResults, relativeTo: rootBodyNode),
                (r.bodyNode.name == "Posterior Neck" || r.bodyNode.name == "Anterior Neck and Middle Chest")
        {
            handleHitHigh(r.bodyNode, r.hitTestResult, didSelectNevus)
        }
        else
        {
            if let r = findNearestChildNodeInHitTestResults(hitResults, relativeTo: rootBodyNode),
               let item = findControlsViewItem(r.bodyNode),
               let target = cameraTargets[item]
            {
                controlsView.selectedItem = item
                
//                SCNTransaction.begin()
//                SCNTransaction.animationDuration = 0.5
                lookAtCameraTarget(target)
//                SCNTransaction.commit()
            }
        }
    }

// MARK: - ControlsViewDelegate
    
    func didTap(controlsView: ControlsView, item: ControlsView.Item)
    {
        if item == .back
        {
            if let bodyNode = selectedBodyNodeLO,
               let cameraMotion = bodyNode.cameraMotion
            {
                cameraMotion.toggleFrontBack()
                cameraMotion.updateNode(cameraNode)
            }
            return
        }
        else
        {
            guard let target = cameraTargets[item] else {
                return
            }
            
            lookAtCameraTarget(target)
        }
    }
    
// MARK: - SCNSceneRendererDelegate
    
    private func updateNeviVisibility()
    {
        let options: [String:Any] = [
            SCNHitTestOption.categoryBitMask.rawValue: 1,
            SCNHitTestOption.firstFoundOnly.rawValue: true,
            SCNHitTestOption.boundingBoxOnly.rawValue: false
        ]
        
        let cameraPos = cameraNode.convertPosition(SCNVector3Zero, to: scene.rootNode)
        
        nevi.forEach { (nevus: Nevus) in
            guard let node = nevus.node else {
                return
            }
            
            let nevusPos = node.convertPosition(SCNVector3Zero, to: scene.rootNode)
            let p = SCNVector3Make(cameraPos.x + 2 * (nevusPos.x - cameraPos.x),
                                   cameraPos.y + 2 * (nevusPos.y - cameraPos.y),
                                   cameraPos.z + 2 * (nevusPos.z - cameraPos.z))
            
            let hitTestResults = scene.rootNode.hitTestWithSegment(from: cameraPos, to: p, options: options)
            
            if let hit = hitTestResults.first {
                node.isHidden = (hit.node == node)
            }
            
//            node.isHidden = !hitTestResults.isEmpty
            
            hitTestResults.forEach {
                let name = $0.node.name ?? "-"
//                debugPrint(">>> \(name)")
            }
        }
    }
    
    public func renderer(_ renderer: SCNSceneRenderer, updateAtTime time: TimeInterval) {
//        updateNeviVisibility()
    }
}
