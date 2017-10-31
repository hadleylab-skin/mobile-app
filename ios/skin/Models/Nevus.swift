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

    enum State {
        case normal
        case selected
        case newlyAdded
    }

    var id: String
    weak var bodyNode: BodyNode?
    var faceIndex: Int
    var coord: SCNVector3
    var direction: SCNVector3
    var node: SCNNode!
  
    var state: State
    {
        didSet {
            updateState()
        }
    }
  
    private let colors: [State:UIColor] = [
        .normal: .red,
        .selected: .yellow,
        .newlyAdded: .green
    ]
  
    private let scales: [State:Float] = [
        .normal: 1,
        .selected: 1.5,
        .newlyAdded: 1.5
    ]
  
    private func updateState()
    {
        material.emission.contents = colors[state]
      
        let s = scales[state] ?? 1
        node.scale = SCNVector3Make(s, s, s)
    }
  
    private var appearance: Appearance = .texturedRect
    
    private var material = SCNMaterial()
    private var pivot: SCNMatrix4!
    
    init(id: String? = nil,
         bodyNode: BodyNode,
         faceIndex: Int,
         coord: SCNVector3,
         direction: SCNVector3 = SCNVector3Zero,
         appearance: Appearance = .texturedRect,
         alwaysVisible: Bool = true,
         state: State = .normal)
    {
        self.id = id ?? UUID().uuidString
        self.bodyNode = bodyNode
        self.faceIndex = faceIndex
        self.coord = coord
        self.direction = direction
        self.appearance = appearance
        self.state = state
      
        super.init()
        
        setupNode()
        setupMaterial()
        setupPivot()
        updateState()
        
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
        
        node.categoryBitMask = 1 | CategoryBits.nevus.rawValue
    }
    
    private func setupPivot()
    {
//        let s: Float = 0.05
//        node.position = SCNVector3Make(coord.x + direction.x * s,
//                                       coord.y + direction.y * s,
//                                       coord.z + direction.z * s)
        
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
}
