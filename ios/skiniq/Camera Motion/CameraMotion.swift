//
//  Created by mutexre on 05/08/2017.
//  Copyright © 2017 mutexre. All rights reserved.
//

import SceneKit

protocol CameraMotion
{
    var position: GLKVector3 { get }
    var pivot: GLKMatrix4 { get }
    
    func reset()
    func toggleFrontBack()
    func move(translation: GLKVector3)
//    func moveToPosition(_ position: GLKVector3) -> Bool
}

extension CameraMotion
{
    func updateNode(_ node: SCNNode)
    {
        node.position = SCNVector3FromGLKVector3(position)
        node.pivot = SCNMatrix4FromGLKMatrix4(pivot)
    }
    
    func updateBodyNode(_ bodyNode: BodyNode) {
        updateNode(bodyNode.node)
    }
}
