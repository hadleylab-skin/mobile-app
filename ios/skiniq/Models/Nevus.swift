//
//  Created by mutexre on 21/07/2017.
//  Copyright © 2017 mutexre. All rights reserved.
//

import SceneKit

@objc class Nevus: NSObject//, Hashable
{
    enum Appearance {
        case sphere
        case model
        case texturedRect
    }

    var id: String
    weak var bodyNode: BodyNode?
    var faceIndex: Int
    var coord: SCNVector3
    var direction: SCNVector3
    var node: SCNNode!
    
    var selected: Bool = false
    {
        didSet
        {
            let duration = 0.1
            
            SCNTransaction.begin()
            SCNTransaction.animationDuration = duration
            updateSelected()
            SCNTransaction.commit()
            
            let scale: CGFloat = (selected ? 1.5 : 1)
            let action = SCNAction.scale(to:scale, duration:duration)
            
            node.runAction(action)
        }
    }
    
    private var appearance: Appearance = .texturedRect
    
    private let defaultColor: UIColor = .red
    private let selectedColor: UIColor = .yellow
    
    private var material = SCNMaterial()
    private var pivot: SCNMatrix4!
    
    init(bodyNode: BodyNode,
         faceIndex: Int,
         coord: SCNVector3,
         direction: SCNVector3,
         appearance: Appearance,
         alwaysVisible: Bool = true)
    {
        self.id = UUID().uuidString
        self.bodyNode = bodyNode
        self.faceIndex = faceIndex
        self.coord = coord
        self.direction = direction
        self.appearance = appearance
      
        super.init()
        
        setupNode()
        setupMaterial()
        setupPivot()
        updateSelected()
        
        material.readsFromDepthBuffer = !alwaysVisible
        node.pivot = (alwaysVisible ? SCNMatrix4Identity : pivot)
    }
    
    private func setupNode()
    {
        switch appearance
        {
            case .sphere:
                node = SCNNode()
                let geometry = SCNSphere(radius: 0.2)
                geometry.segmentCount = 30
                node.geometry = geometry
            
            case .model:
                let scene = SCNScene(named: "art.scnassets/Mole.scn")
                node = scene!.rootNode.childNode(withName: "Mole", recursively: false)!

                let s: Float = 1.25
                node.scale = SCNVector3Make(s, s, s)

            case .texturedRect:
                node = SCNNode()
                let s: CGFloat = 0.5
                let geometry = SCNPlane(width: s, height: s)
                node.geometry = geometry
        }
        
        node.categoryBitMask = 1 | 4
    }
    
    private func setupPivot()
    {
        let s: Float = 0.05
        node.position = SCNVector3Make(coord.x + direction.x * s,
                                       coord.y + direction.y * s,
                                       coord.z + direction.z * s)
        
        let m = GLKMatrix4MakeLookAt(0, 0, 0, direction.x, direction.y, direction.z, 0, 0, 1)
        pivot = SCNMatrix4FromGLKMatrix4(m)
    }
    
    private func setupMaterial()
    {
        switch appearance
        {
            case .model:
                material.lightingModel = .blinn
                material.blendMode = .replace
                material.isDoubleSided = false
            
            case .sphere:
                material.lightingModel = .blinn
                material.blendMode = .replace
                material.isDoubleSided = false
            
            case .texturedRect:
                material.lightingModel = .constant
                material.blendMode = .alpha
                material.isDoubleSided = true
                material.transparencyMode = .aOne
                material.diffuse.contents = #imageLiteral(resourceName: "dot-selected")
                material.transparent.contents = #imageLiteral(resourceName: "dot-selected")
        }
        
        material.ambient.contents = 0
        material.diffuse.contents = 0
        material.specular.contents = 0
        
        node.geometry?.materials = [ material ]
    }
    
    private func updateSelected() {
        material.emission.contents = (selected ? selectedColor : defaultColor)
    }
    
// MARK: - Hashable

//    var hashValue: Int {
//        return node.hashValue
//    }
//    
//    static func == (lhs: Nevus, rhs: Nevus) -> Bool {
//        return lhs.hashValue == rhs.hashValue
//    }
}
