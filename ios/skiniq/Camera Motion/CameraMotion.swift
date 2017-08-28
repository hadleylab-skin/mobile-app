//
//  Created by mutexre on 05/08/2017.
//  Copyright © 2017 mutexre. All rights reserved.
//

import SceneKit

enum CameraZoomMode
{
    case translate
    case fov
}

protocol CameraMotion
{
    typealias UpFunc = (GLKVector3, GLKVector3) -> GLKVector3 // return non-native coord
    typealias TargetFunc = (GLKVector3, GLKVector3) -> GLKVector3 // return non-native coord
  
    var position: GLKVector3 { get }
    var nativePosition: GLKVector3 { get set }
    var target: GLKVector3 { get }
    var pivot: GLKMatrix4 { get }
    
    var zoomMode: CameraZoomMode { get set }
    var initialFov: Double? { get set }
    var minFov: Double? { get set }
    var maxFov: Double? { get set }
  
    var up: GLKVector3? { get set }
    var upFunc: UpFunc? { get set }
    
    var targetFunc: TargetFunc? { get set }
  
    func reset()
    func toggleFrontBack()
    func move(_ translation: GLKVector3) -> GLKVector3

    func getRepresentationVertexGroups(z: Float, nx: Int, ny: Int) -> [[GLKVector3]]
}

//class CameraMotion1
//{
//    var position: GLKVector3 {
//        preconditionFailure("This method must be overridden")
//    }
//  
//    var pivot: GLKMatrix4 {
//        preconditionFailure("This method must be overridden")
//    }
//  
//    var zoomMode: CameraZoomMode = .translate
//
//    var initialFov: Float?
//    var minFov: Float?
//    var maxFov: Float?
//  
//    func reset() {
//        preconditionFailure("This method must be overridden")
//    }
//  
//    func toggleFrontBack() {
//        preconditionFailure("This method must be overridden")
//    }
//  
//    func move(_ translation: GLKVector3) -> GLKVector3 {
//        preconditionFailure("This method must be overridden")
//    }
//
//    func getRepresentationVertexGroups(z: Float, nx: Int, ny: Int) -> [[GLKVector3]] {
//      preconditionFailure("This method must be overridden")
//    }
//}

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
  
    private func getRepresentationGeometry(vertices: [GLKVector3]) -> SCNGeometry?
    {
        let source = SCNGeometrySource(vertices: vertices.map {
            return SCNVector3FromGLKVector3($0)
        })
      
        let element =
            SCNGeometryElement(data: nil,
                               primitiveType: .point,
                               primitiveCount: vertices.count,
                               bytesPerIndex: 4)
      
        return SCNGeometry(sources: [source], elements: [element])
    }
  
    func getRepresentationGeometries(z: Float, nx: Int, ny: Int) -> [SCNGeometry]
    {
        let vertexGroups = getRepresentationVertexGroups(z: z, nx: nx, ny: ny)
      
        return vertexGroups.flatMap { (vertices: [GLKVector3]) -> SCNGeometry? in
            return getRepresentationGeometry(vertices: vertices)
        }
    }
  
    func getRepresentationNode(z: Float, nx: Int, ny: Int, color: UIColor) -> SCNNode?
    {
        let geometries = getRepresentationGeometries(z: z, nx: nx, ny: ny)
      
        guard !geometries.isEmpty else {
            return nil
        }
      
        let material = SCNMaterial()
        material.lightingModel = .constant
        material.diffuse.contents = color
      
        let root = SCNNode()
      
        geometries.forEach { (geometry: SCNGeometry) in
            geometry.materials = [ material ]
            let node = SCNNode(geometry: geometry)
            root.addChildNode(node)
        }
      
        return root
    }
    
    internal func clamp<T: FloatingPoint>(_ x: T, min: T?, max: T?) -> (value: T, remainder: T)
    {
        var result = x
        var remainder: T = 0
      
        if let min = min {
            if x < min {
                remainder = x - min
                result = min
            }
        }

        if let max = max {
            if x > max {
                remainder = result - max
                result = max
            }
        }
      
        return (result, remainder)
    }
    
//    internal func computePivot(_ eye: Coord) -> GLKMatrix4
//    {
//        let eyeXyz = convert(eye)
//        var targetXyz = getDefaultTarget(coord: eye)
//        let up = upFunc?(position, nativePosition) ?? self.up
//        
//        let pivot = GLKMatrix4MakeLookAt(0, 0, 0,
//                                         targetXyz.x - eyeXyz.x,
//                                         targetXyz.y - eyeXyz.y,
//                                         targetXyz.z - eyeXyz.z,
//                                         up.x, up.y, up.z)
//        
//        return pivot
//    }
}
