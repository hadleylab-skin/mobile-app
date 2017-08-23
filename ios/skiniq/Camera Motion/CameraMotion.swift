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

    func getRepresentationVertices(z: Float, nx: Int, ny: Int) -> [GLKVector3]?
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
  
    func getRepresentationGeometry(z: Float, nx: Int, ny: Int) -> SCNGeometry?
    {
        guard let vertices = getRepresentationVertices(z: z, nx: nx, ny: ny) else {
            return nil
        }
      
        let source = SCNGeometrySource(vertices: vertices.map {
            return SCNVector3FromGLKVector3($0)
        })
      
        let element = SCNGeometryElement(data: nil, primitiveType: .point, primitiveCount: nx * ny, bytesPerIndex: 4)
      
        return SCNGeometry(sources: [source], elements: [element])
    }
  
    func getRepresentationNode(z: Float, nx: Int, ny: Int, color: UIColor) -> SCNNode?
    {
        guard let geometry = getRepresentationGeometry(z: z, nx: nx, ny: ny) else {
            return nil
        }
      
        let material = SCNMaterial()
        material.lightingModel = .constant
        material.diffuse.contents = color
        geometry.materials = [ material ]
      
        return SCNNode(geometry: geometry)
    }
}
