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

enum CategoryBits : Int {
    case flatClone = 2
    case nevus = 4
    case border = 8
    case translucent = 16
}

@objc protocol BodyViewDelegate
{
    func bodyView(_ bodyView: BodyView3D, bodyNodeSelected bodyPart: String?)
    func bodyView(_ bodyView: BodyView3D, nevusAdded nevus: Nevus)
    func bodyView(_ bodyView: BodyView3D, nevusSelected nevus: Nevus)
}

class BodyView3D: UIView, SCNSceneRendererDelegate
{
    var delegate: BodyViewDelegate?
  
    internal var models: [String:BodyModel] = [:]
  
    internal var currentModel: BodyModel?
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
      
        lookAtCameraTarget(.front)
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
  
    internal var newNevus: Nevus?
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
          
            guard let nevus = newNevus,
                  let node = nevus.node,
                  let modelRootNode = currentModel?.rootBodyNode.node
            else {
                return
            }
          
            nevus.state = .newlyAdded
          
            neviRootNode.addChildNode(node)
            node.position = modelRootNode.convertPosition(nevus.coord, to: neviRootNode)
            
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
                      let positionZ = m["positionZ"] as? Float,
                      let bodyNode = currentModel?.lookupBodyNode(name: anatomicalSite),
                      let modelRootNode = currentModel?.rootBodyNode.node
                else {
                    return
                }
              
                let nevus = Nevus(id: id, bodyNode: bodyNode, faceIndex: faceIndex,
                                  coord: SCNVector3Make(positionX, positionY, positionZ),
                                  state: .normal)
              
                neviRootNode.addChildNode(nevus.node)
                nevus.node.position = modelRootNode.convertPosition(nevus.coord, to: neviRootNode)
              
                bodyNode.add(nevus: nevus)

                let lookAt = SCNLookAtConstraint(target: cameraNode)
                nevus.node.constraints = [ lookAt ]

                nevi.insert(nevus)
                neviByNode[nevus.node] = nevus
              
                showNevi(for: selectedBodyNodeHI)
            }
        }
    }
  
    private let backgroundView = RadialGradientView()
    internal let sceneView = SCNView()
    internal let controlsView = ControlsView()
    private let bodyNodeLabel = UILabel()
    
    private let scene = SCNScene()
    private let commonRootNode = SCNNode()
    private let neviRootNode = SCNNode()
    
    internal let camera = SCNCamera()
    internal let cameraNode = SCNNode()
  
    internal var selectedBodyNodeLO: BodyNode! {
        didSet {
            updateBodyNodeLabel()
            let name = selectedBodyNodeLO?.name ?? "none"
            delegate?.bodyView(self, bodyNodeSelected: name)
            
            oldValue?.borderNode?.isHidden = true
            selectedBodyNodeLO?.borderNode?.isHidden = false
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
  
    internal var lastPanCoord: CGPoint?
    internal var lastPinchScale: Float?
    
    private var rotation: SCNMatrix4 = SCNMatrix4Identity
    private var scale: SCNMatrix4 = SCNMatrix4Identity
  
    private let continueToCloseUpPhotoButton = UIButton()
    private let continueToCloseUpPhotoButtonHeight = 50.0
    private var continueToCloseUpPhotoButtonBottomOffset: Constraint?
    
    internal let showTargetPoints = true
    
// MARK: - Setup
    
    private func setupNodes()
    {
        scene.rootNode.addChildNode(commonRootNode)
        commonRootNode.addChildNode(neviRootNode)
        
        let s = 0.275
        commonRootNode.scale = SCNVector3(s, s, s)
    }
  
    private func setupBodyModels()
    {
        setupMale()
        setupFemale()
        setupChild()
        currentModel = models["child"]
    }
    
    private func setupCamera()
    {
        camera.zNear = 0.01
        camera.zFar = 45
        camera.yFov = 60
//        camera.motionBlurIntensity = 1.0
//        camera.focalDistance = 10
//        camera.focalSize = 3
//        camera.focalBlurRadius = 10

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
    
    internal func updateCameraTargetDebugPoint(_ motion: CameraMotion)
    {
        cameraTargetDebugPoint.position = SCNVector3FromGLKVector3(motion.target)
    }
    
    private func setupLights()
    {
        let dirLight = SCNLight()
        dirLight.type = .directional
        dirLight.intensity = 650
        cameraNode.light = dirLight
      
        let ambient = SCNLight()
        ambient.type = .ambient
        ambient.intensity = 150
        scene.rootNode.light = ambient
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

    deinit {
        print(">>> Deinit")
    }

    override func removeFromSuperview()
    {
        print(">>> Remove from superview")
      
        super.removeFromSuperview()
      
        models.removeAll()
        currentModel = nil
        commonRootNode.removeFromParentNode()
        neviRootNode.removeFromParentNode()
        nevi.removeAll()
        selectedNevus = nil
        selectedBodyNodeLO = nil
        selectedBodyNodeHI = nil
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

    internal func lookAtCameraTarget(_ target: CameraTarget)
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
        
        selectedNevus?.state = .normal
        selectedNevus = nil
      
        newNevus?.state = .normal
    }
    
    private func highlightBodyNode(_ bodyNode: BodyNode?)
    {
        if let bodyNode = bodyNode
        {
            bodyNode.opacity = 1
            currentModel?.makeAllNodeTransparentExceptNode(bodyNode)
        }
        else {
            currentModel?.makeAllNodesOpaque()
        }
    }

    internal func findControlsViewItem(_ bodyNode: BodyNode) -> ControlsView.Item?
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
    
    internal func findFarthestChildNodeInHitTestResults(_ hitResults: [SCNHitTestResult], relativeTo parent: BodyNode)
        -> (hitTestResult: SCNHitTestResult, bodyNode: BodyNode)?
    {
        if let r = zipBodyNodesAndDistanceToParentInHitTestResults(hitResults, relativeTo: parent)?.sorted(by: {
            return $0.distance > $1.distance
        }).first {
            return (r.hitTestResult, r.bodyNode)
        }
        
        return nil
    }

    internal func findNearestChildNodeInHitTestResults(_ hitResults: [SCNHitTestResult], relativeTo parent: BodyNode)
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
        let node = bodyNode.node
        
        guard let geometry = node.geometry else {
            return
        }
        
        let faceIndex = hitTestResult.faceIndex
        let coord = node.convertPosition(hitTestResult.localCoordinates, to: currentModel?.rootBodyNode.node)
        
//        debugPrint(">> Geometry index: \(hitTestResult.geometryIndex)");
//        debugPrint(">> Face index: \(faceIndex)");
//        debugPrint(">> Coord: x=\(coord.x), y=\(coord.y), z=\(coord.z)");
      
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
    }
    
    internal func handleHitHigh(_ bodyNode: BodyNode, _ hitTestResult: SCNHitTestResult, _ didSelectNevus: Bool)
    {
        if selectedBodyNodeHI == bodyNode
        {
            if !didSelectNevus
            {
                addNevus(bodyNode: bodyNode, hitTestResult: hitTestResult)
                
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

    internal func nevusHitTest(_ hitTestResults: [SCNHitTestResult]) -> Nevus?
    {
        let nevusHitResult = hitTestResults.first(where: {
            $0.node.parent == neviRootNode
        })
        
        if let nevusNode = nevusHitResult?.node,
           let nevus = neviByNode[nevusNode],
           selectedNevus != nevus,
           nevus.state == .normal
        {
            selectedNevus?.state = .normal
          
            selectedNevus = nevus
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
}
