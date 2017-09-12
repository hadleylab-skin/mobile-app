//
//  Created by mutexre on 21/07/2017.
//  Copyright © 2017 mutexre. All rights reserved.
//

import SceneKit

@objc class BodyNode: NSObject
{
    var node: SCNNode
    var borderNode: SCNNode?
    
    weak var parent: BodyNode?
    var children: Set<BodyNode> = []

    var name: String? {
        get {
            return node.name
        }
    }

    var nevi = Set<Nevus>()
    
    var opacity: CGFloat
    {
        get {
            return node.opacity
        }
        
        set {
            node.opacity = newValue
            flattenedClone?.opacity = newValue
        }
    }
    
    var cameraMotion: CameraMotion?
    
    var selected: Bool = false {
        didSet {
            color = (selected ? selectedColor : defaultColor)
            children.forEach { $0.selected = self.selected }
        }
    }
    
    func flatten()
    {
        createFlattenedCloneIfNeeded()
        node.isHidden = true
    }

// MARK: -

    init(_ node: SCNNode)
    {
        self.node = node
        
        super.init()
        
        setupNode()
        setupMaterial()
        reset()
    }

    private func setupNode()
    {
        loadChildren()
        node.addChildNode(neviRootNode)
    }

    private func loadChildren()
    {
        for child in node.childNodes
        {
            let childBodyNode = BodyNode(child)
            childBodyNode.parent = self
            children.insert(childBodyNode)
        }
    }

    private func setupMaterial()
    {
        guard let geometry = node.geometry else {
            return
        }
        
        material.lightingModel = .physicallyBased
        material.metalness.contents = 0
        material.roughness.contents = 0.5
//        material.normal.contents = "male-normal-map"
//        material.transparency = 0.15
        
        geometry.materials = [ material ]
    }

    private func createFlattenedCloneIfNeeded()
    {
        guard flattenedClone == nil else {
            return
        }
        
        flattenedClone = node.flattenedClone()
        
        if let clone = flattenedClone
        {
            clone.categoryBitMask |= CategoryBits.flatClone.rawValue
            
            if let parent = node.parent {
                clone.pivot = parent.transform
            }
            
            node.parent?.addChildNode(clone)
        }
    }
    
    func add(nevus: Nevus) {
        nevi.insert(nevus)
    }
    
    func remove(nevus: Nevus) {
        nevi.remove(nevus)
    }
    
    func reset() {
        color = defaultColor
    }
    
    func isChildOf(_ node: BodyNode) -> Bool
    {
        var node: BodyNode? = self
        
        while node != nil
        {
            if node!.parent == parent {
                return true
            }
            
            node = node!.parent
        }
        
        return false
    }
    
    func getDistanceToParent(_ parent: BodyNode) -> Int?
    {
        var node: BodyNode? = self
        var count = 0
        
        while node != nil
        {
            if node == parent {
                return count
            }
            
//            if node!.parent == parent {
//                return count
//            }
            
            count = count + 1
            
            node = node!.parent
        }
        
        return nil
    }
    
// MARK: -

    private let neviRootNode = SCNNode()
    private var material = SCNMaterial()

    private let defaultColor: UIColor = UIColor(white: 0.9, alpha: 1)
    private let selectedColor: UIColor = UIColor(hue: 0, saturation: 0.25, brightness: 1, alpha: 1)

    private var color: UIColor?
    {
        get {
            return material.diffuse.contents as? UIColor
        }
        
        set {
            material.diffuse.contents = newValue
        }
    }
    
    var flattenedClone: SCNNode?
}
