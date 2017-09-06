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
  
    private var models: [String:BodyModel] = [:]
  
    private var currentModel: BodyModel?
    {
        didSet {
            oldValue?.rootNode.removeFromParentNode()
            oldValue?.debugNode.removeFromParentNode()
            updateCurrentModel()
        }
    }
  
    private func updateCurrentModel()
    {
        guard let model = currentModel else {
            return
        }
        
        commonRootNode.addChildNode(model.rootNode)
        scene.rootNode.addChildNode(model.debugNode)
        neviRootNode.transform = model.rootNode.transform
    }
  
    var sex: String = "male" {
        didSet
        {
            guard let model = models[sex] else {
                print("Model not found")
                return
            }
          
            currentModel = model
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
                      let bodyNode = currentModel?.lookupBodyNode(name: anatomicalSite) //bodyNodesByName[anatomicalSite]
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
  
    private let backgroundView = RadialGradientView()
    private let sceneView = SCNView()
    private let controlsView = ControlsView()
    private let bodyNodeLabel = UILabel()
    
    private let scene = SCNScene()
    private let commonRootNode = SCNNode()
    private let neviRootNode = SCNNode()
    
    private let camera = SCNCamera()
    private let cameraNode = SCNNode()
  
    private var selectedBodyNodeLO: BodyNode! {
        didSet {
            updateBodyNodeLabel()
            let name = selectedBodyNodeLO?.name ?? "none"
            delegate?.bodyView(self, bodyNodeSelected: name)
        }
    }
    
    private var selectedBodyNodeHI: BodyNode? {
        didSet {
            updateBodyNodeLabel()
            showNevi(for: selectedBodyNodeHI)
            newNevus = nil
        }
    }
    
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
  
    private let continueToCloseUpPhotoButton = UIButton()
    private let continueToCloseUpPhotoButtonHeight = 50.0
    private var continueToCloseUpPhotoButtonBottomOffset: Constraint?
    
    private let showTargetPoints = false
    
// MARK: - Setup
    
    private func setupNodes()
    {
        scene.rootNode.addChildNode(commonRootNode)
        commonRootNode.addChildNode(neviRootNode)
        
        let s = 0.275
        commonRootNode.scale = SCNVector3(s, s, s)
    }
  
    private func setupMaleBodyModel()
    {
        let bodyCenter = GLKVector3Make(0, -1, 0)
        let headCenter = GLKVector3Make(0, 7.5, 0)
        let rightArmOrigin = GLKVector3Make(-2, 5, -0.5)
        let leftArmOrigin = GLKVector3Make(2, 5, -0.5)
        let rightLegOrigin = GLKVector3Make(-1, -2, -0.25)
        let leftLegOrigin = GLKVector3Make(1, -2, -0.25)
        
        let rightArmTargetPoints: [TargetPoint] = [
            (0.0, rightArmOrigin),
            (1.0, GLKVector3Make(-2.75, 3, -0.65)),
            (2.0, GLKVector3Make(-3.25, 1.8, -0.7)),
            (3.0, GLKVector3Make(-4.1, -0.5, -0.25)),
            (4.0, GLKVector3Make(-4.25, -1.25, 0))
        ]
      
        let leftArmTargetPoints = rightArmTargetPoints.map { p -> (x: Float, pos: GLKVector3) in
            var p = p
            p.pos.x = -p.pos.x
            return p
        }

        let rightLegTargetPoints: [TargetPoint] = [
            (0.0, rightLegOrigin),
            (1.0, GLKVector3Make(-1.15, -5.5, -0.3)),
            (1.75, GLKVector3Make(-1.3, -10.25, -0.5)),
            (2.0, GLKVector3Make(-1.4, -10.4, 0.15)),
            (3.0, GLKVector3Make(-1.5, -10.5, 0.75))
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
                                   cylinderH2: 2.5,
                                   angle: 0.2 * Float.pi / 2,
                                   targetPoints: rightArmTargetPoints)

        let leftArmConfig =
            ArmCameraMotion.Config(origin: leftArmOrigin,
                                   axisZ: GLKVector3Make(1.25, -3.2, -0.2),
                                   axisY: GLKVector3Make(-0.25, 0, 1),
                                   r: 4,
                                   cylinderH1: 2,
                                   cylinderH2: 2.5,
                                   angle: 0.2 * Float.pi / 2,
                                   targetPoints: leftArmTargetPoints)
        
        let rightLegConfig =
            LegCameraMotion.Config(origin: rightLegOrigin,
                                   axisZ: GLKVector3Make(-0.025, -1, -0.1),
                                   axisY: GLKVector3Make(-0.25, 0, 1),
                                   r: 4,
                                   cylinderH: 4.5,
                                   angle: (2 / 3) * Float.pi / 2,
                                   targetPoints: rightLegTargetPoints)
        
        let leftLegConfig =
            LegCameraMotion.Config(origin: leftLegOrigin,
                                   axisZ: GLKVector3Make(0.025, -1, -0.1),
                                   axisY: GLKVector3Make(0.25, 0, 1),
                                   r: 4,
                                   cylinderH: 4.5,
                                   angle: (2 / 3) * Float.pi / 2,
                                   targetPoints: leftLegTargetPoints)

        models["male"] =
            try! BodyModel(assetName: "art.scnassets/Male.scn",
                           bodyCenter: bodyCenter,
                           headCenter: headCenter,
                           rightArmConfig: rightArmConfig,
                           leftArmConfig: leftArmConfig,
                           rightLegConfig: rightLegConfig,
                           leftLegConfig: leftLegConfig,
                           showTargetPoints: showTargetPoints)
    }
  
    private func setupFemaleBodyModel()
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

        models["female"] =
            try! BodyModel(assetName: "art.scnassets/Female.scn",
                           bodyCenter: bodyCenter,
                           headCenter: headCenter,
                           rightArmConfig: rightArmConfig,
                           leftArmConfig: leftArmConfig,
                           rightLegConfig: rightLegConfig,
                           leftLegConfig: leftLegConfig,
                           showTargetPoints: showTargetPoints)
    }
  
    private func setupBodyModels()
    {
        setupMaleBodyModel()
        setupFemaleBodyModel()
        currentModel = models["male"]
    }
    
    private func setupCamera()
    {
        camera.zNear = 0.1
        camera.yFov = 70

        cameraNode.camera = camera
        scene.rootNode.addChildNode(cameraNode)

        lookAtWholeBody(front: true)
    }
    
    private let cameraTargetDebugPoint: SCNNode =
        createBall(size: 0.15, color: .green)

    private func setupCameraTargetDebugPoint()
    {
        scene.rootNode.addChildNode(cameraTargetDebugPoint)
        cameraTargetDebugPoint.isHidden = true
    }
    
    private func updateCameraTargetDebugPoint(_ motion: CameraMotion)
    {
        cameraTargetDebugPoint.position = SCNVector3FromGLKVector3(motion.target)
    }
    
    private func setupLights()
    {
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
        setupBodyModels()
        setupCamera()
        setupLights()
        setupGestureRecognizers()
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

    private var showContinueToCloseUpPhotoButton = false

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
        
        guard let motion = currentModel?.rootBodyNode.cameraMotion as? SphericalMotion else {
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
                guard selectedBodyNodeLO != currentModel?.rootBodyNode else {
                    return
                }
                
                lookAtWholeBody(front: true)
                highlightBodyNode(nil)
                selectedBodyNodeLO = currentModel?.rootBodyNode
                controlsView.selectedItem = .body
            
            case .back:
                guard selectedBodyNodeLO != currentModel?.rootBodyNode else {
                    return
                }
                
                lookAtWholeBody(front: false)
                highlightBodyNode(nil)
                selectedBodyNodeLO = currentModel?.rootBodyNode
                controlsView.selectedItem = .body
            
            case .bodyNode(let bodyNode):
                guard selectedBodyNodeLO != bodyNode else {
                    return
                }
                
                lookAtBodyNode(bodyNode)
                highlightBodyNode(bodyNode)
                selectedBodyNodeLO = bodyNode
                
                if let item = currentModel?.bodyNodesControlViewItems[bodyNode] {
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
            currentModel?.makeAllNodeTransparentExceptNode(bodyNode)
        }
        else
        {
            currentModel?.makeAllNodesOpaque()
        }
    }

    private func findControlsViewItem(_ bodyNode: BodyNode) -> ControlsView.Item?
    {
        if let item = currentModel?.bodyNodesControlViewItems[bodyNode] {
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
            
            guard let bodyNode = currentModel?.lookupBodyNode(sceneNode: node),
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
          
            let name = bodyNode.name ?? "none"
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
              bodyNode != currentModel?.rootBodyNode
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
        bodyNodeLabel.text = bodyNode.name ?? bodyNode.name
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
        guard let currentModel = currentModel else {
            return
        }
      
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
        
        if selectedBodyNodeLO != currentModel.rootBodyNode,
           let r = findFarthestChildNodeInHitTestResults(hitResults, relativeTo: selectedBodyNodeLO)
        {
            handleHitHigh(r.bodyNode, r.hitTestResult, didSelectNevus)
        }
        else if selectedBodyNodeLO == currentModel.rootBodyNode,
                let r = findFarthestChildNodeInHitTestResults(hitResults, relativeTo: currentModel.trunk)
        {
            if let r = findNearestChildNodeInHitTestResults(hitResults, relativeTo: currentModel.rootBodyNode),
               r.bodyNode.parent != currentModel.trunk,
               let item = findControlsViewItem(r.bodyNode),
               let target = currentModel.cameraTargets[item]
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
        else if selectedBodyNodeLO == currentModel.rootBodyNode,
                let r = findNearestChildNodeInHitTestResults(hitResults, relativeTo: currentModel.rootBodyNode),
                (r.bodyNode.name == "Posterior Neck" || r.bodyNode.name == "Anterior Neck and Middle Chest")
        {
            handleHitHigh(r.bodyNode, r.hitTestResult, didSelectNevus)
        }
        else
        {
            if let rootBodyNode = currentModel.rootBodyNode,
               let r = findNearestChildNodeInHitTestResults(hitResults, relativeTo: currentModel.rootBodyNode),
               let item = findControlsViewItem(r.bodyNode),
               let target = currentModel.cameraTargets[item]
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
        guard let currentModel = currentModel else {
            return
        }
        
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
            guard let target = currentModel.cameraTargets[item] else {
                return
            }
            
            lookAtCameraTarget(target)
        }
    }
}
