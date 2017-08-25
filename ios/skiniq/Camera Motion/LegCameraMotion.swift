//
//  LegCameraMotion.swift
//  skiniq
//
//  Created by mutexre on 21/08/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

import SceneKit

class LinkedList<T>
{
    class Node
    {
        var value: T?
        var prev: Node?
        var next: Node?
      
        init(value: T, prev: Node? = nil, next: Node? = nil)
        {
            self.value = value
            self.prev = prev
            self.next = next
        }
    }
  
    var first: Node?
    var last: Node?
  
    init(values: [T])
    {
        var prev: Node?
      
        for v in values
        {
            let node = Node(value: v, prev: prev, next: nil)
            node.value = v
          
            node.prev = prev
            prev?.next = node
          
            prev = node
          
            if first == nil {
                first = node
            }
        }
      
        last = prev
    }
  
    convenience init(value: T) {
        self.init(values: [value])
    }
}

class LegCameraMotion: CameraMotion
{
//    enum Segment {
//        case cyl1
//        case torus
//        case cyl2
//        case semisphere
//    }

    private var cyl1: CylindricalMotion
    private var torus: ToroidalMotion
    private var cyl2: CylindricalMotion
    private var semisphere: SphericalMotion
  
    private var currentMotionController: CameraMotion
  
    private var chains: LinkedList<CameraMotion>
    private var currentChain: LinkedList<CameraMotion>.Node?
  
    init(origin: GLKVector3,
         axisZ: GLKVector3,
         axisY: GLKVector3,
         cylLen1: Float,
         cylLen2: Float,
         torusR: Float,
         r: Float)
    {
        cyl1 = CylindricalMotion(origin: origin,
                                 axisZ: axisZ,
                                 axisR: axisY,
                                 minR: r,
                                 maxR: r,
                                 minPhi: nil,
                                 maxPhi: nil,
                                 minZ: 0,
                                 maxZ: cylLen1,
                                 initialCoord: (r: r, phi: 0, z: 0),
                                 velocity: (r: 0.01, phi: 0.01, z: 0.01))
      
        let axisZ_norm = GLKVector3Normalize(axisZ)
        let axisY_norm = GLKVector3Normalize(axisY)
//        let torusAxisZ = GLKVector3CrossProduct(axisZ_norm, axisY_norm)
//        let torusAxisR1 = GLKVector3MultiplyScalar(axisY, -1)
      
        torus = ToroidalMotion(origin: cyl1.end!,
                               dirToCenter: axisY,
                               dir: axisZ,
                               R1: torusR,
                               minR2: r,
                               maxR2: r,
                               minTheta: -Float.pi / 3,
                               maxTheta: +Float.pi / 3,
                               minPhi: nil,
                               maxPhi: nil,
                               initialCoord: (R2: r, theta: 0, phi: 0),
                               velocity: (R2: 0.01, theta: 0.01, phi: 0.01))
      
        cyl2 = CylindricalMotion(origin: torus.end!,
                                 axisZ: axisY,
                                 axisR: axisZ,
                                 minR: r,
                                 maxR: r,
                                 minPhi: nil,
                                 maxPhi: nil,
                                 minZ: 0,
                                 maxZ: cylLen2,
                                 initialCoord: (r: r, phi: 0, z: 0),
                                 velocity: (r: 0.01, phi: 0.01, z: 0.01))

        semisphere = SphericalMotion(center: cyl2.end!,
                                     axisTheta: axisY,
                                     axisPhi: axisZ,
                                     minR: r,
                                     maxR: r,
                                     minTheta: 0,
                                     maxTheta: Float.pi / 2,
                                     minPhi: nil,
                                     maxPhi: nil,
                                     initialCoord: (r: r, theta: 0, phi: 0),
                                     velocity: (r: 0.01, theta: 0.01, phi: 0.01))
      
//        segment = initialSegment
        currentMotionController = cyl1 //getMotionController(for: initialSegment)
      
        chains = LinkedList<CameraMotion>(values: [
            cyl1, torus, cyl2, semisphere
        ])
      
        currentChain = chains.first
    }
  
//    private func getMotionController(for segment: Segment) -> CameraMotion?
//    {
//        switch segment
//        {
//            case .cyl1: return cyl1
//            case .torus: return torus
//            case .cyl2: return cyl2
//            case .semisphere: return semisphere
//        }
//    }
  
//    private var nextMap: [CameraMotion:CameraMotion?] = [:]
//  
//    private func getNextMotionController(for motionController: CameraMotion) -> CameraMotion?
//    {
//        if motionController is cyl1 {
//            return torus
//        }
//        else if motionController == torus {
//            return cyl2
//        }
//        else if motionController == cyl2 {
//            return semisphere
//        }
//        else if motionController == semisphere {
//            return nil
//        }
//    }
  
    var position: GLKVector3
    {
        return currentMotionController.position
    }

    var pivot: GLKMatrix4 {
        return currentMotionController.pivot
    }
  
    var zoomMode: CameraZoomMode {
        return .fov
    }

    var prev: CameraMotion?
    var next: CameraMotion?
  
    func reset() {
        currentMotionController = cyl1
        cyl1.reset()
    }
  
    func toggleFrontBack() {
        currentMotionController.toggleFrontBack()
    }
  
    func move(_ translation: GLKVector3) {
        currentMotionController.move(translation)
    }

    func getRepresentationVertices(z: Float, nx: Int, ny: Int) -> [GLKVector3]? {
        return cyl1.getRepresentationVertices(z: z, nx: nx, ny: ny)
    }
}

//class LegCameraMotion2: CameraMotion
//{
//    typealias Coord = (r: Float, phi: Float, z: Float)
//    
//    var start: GLKVector3
//    var axisZ: GLKVector3
//    var axisR: GLKVector3
//    var cylinderHeight: Float?
//    var minR: Float?
//    var maxR: Float?
//    var minPhi: Float?
//    var maxPhi: Float?
//    var minZ: Float?
//    var maxZ: Float?
//    var initialCoord: Coord
//    var velocity: Coord
//    
//    var position: GLKVector3 {
//        return convert(currentCoord)
//    }
//
//    var pivot: GLKMatrix4 {
//        return computePivot(currentCoord)
//    }
//    
//    private var currentCoord: Coord
//    
//    private var axisZ_norm: GLKVector3 {
//        return GLKVector3Normalize(axisZ)
//    }
//    
//    private var axisR_norm: GLKVector3  {
//        return GLKVector3Normalize(axisR)
//    }
//    
//    init(start: GLKVector3,
//         axisZ: GLKVector3, axisR: GLKVector3,
//         minR: Float?, maxR: Float?,
//         minPhi: Float?, maxPhi: Float?,
//         minZ: Float?, maxZ: Float?,
//         initialCoord: Coord,
//         velocity: Coord)
//    {
//        self.start = start
//        self.axisZ = axisZ
//        self.axisR = axisR
//        self.minR = minR
//        self.maxR = maxR
//        self.minPhi = minPhi
//        self.maxPhi = maxPhi
//        self.minZ = minZ
//        self.maxZ = maxZ
//        self.initialCoord = initialCoord
//        self.velocity = velocity
//        currentCoord = initialCoord
//        reset()
//    }
//    
////    private func convert(_ xyz: GLKVector3) -> Coord
////    {
////        let v = GLKVector3Make(xyz.x - start.x, xyz.y - start.y, xyz.z - start.z)
////        let dot_v_axisZ = GLKVector3DotProduct(v, axisZ_norm)
////        let z = dot_v_axisZ
////        
////        let lenV = GLKVector3Length(v)
////        let r = sqrt(lenV * lenV - z * z)
////        
////        let zv = GLKVector3MultiplyScalar(axisZ_norm, z)
////        let rv = GLKVector3Subtract(v, zv)
////        let lenRv = GLKVector3Length(rv)
////        let dot_rv_axisR = GLKVector3DotProduct(rv, axisR_norm)
////        let cos = dot_rv_axisR / lenRv
////        let phi = acos(cos)
////        
////        return (r:r, phi:phi, z:z)
////    }
//    
//    internal func convert(_ coord: Coord) -> GLKVector3
//    {
//        print(coord.phi)
//        let zv = GLKVector3MultiplyScalar(axisZ_norm, coord.z)
//        let rv = GLKVector3MultiplyScalar(axisR_norm, coord.r)
//        
//        let rotation = GLKMatrix3Rotate(GLKMatrix3Identity, coord.phi, axisZ_norm.x, axisZ_norm.y, axisZ_norm.z)
//        let rv_rotated = GLKMatrix3MultiplyVector3(rotation, rv)
//        let zv_plus_rv_rotated = GLKVector3Add(zv, rv_rotated)
//        
//        return GLKVector3Add(start, zv_plus_rv_rotated)
//    }
//    
//    private func computePivot(_ coord: Coord) -> GLKMatrix4
//    {
//        let centerCoord = Coord(r:0, phi:coord.phi, z:coord.z)
//        let xyz = convert(coord)
//        let centerXyz = convert(centerCoord)
//        
//        let pivot = GLKMatrix4MakeLookAt(0, 0, 0,
//                                         centerXyz.x - xyz.x,
//                                         centerXyz.y - xyz.y,
//                                         centerXyz.z - xyz.z,
//                                         axisZ.x, axisZ.y, axisZ.z)
//        
//        return pivot
//    }
//    
//    func reset() {
//        currentCoord = initialCoord
//    }
//    
//    func toggleFrontBack() {
//        currentCoord.phi = cos(currentCoord.phi) > 0 ? Float.pi : 0
//    }
//    
//    func move(translation: GLKVector3)
//    {
//        var r = currentCoord.r + velocity.r * translation.z
//
//        r = max(r, minR ?? 0)
//
//        if let maxR = maxR {
//            r = min(r, maxR)
//        }
//        
//        var phi = currentCoord.phi - velocity.phi * translation.x
//        
//        if let minPhi = minPhi {
//            phi = max(phi, minPhi)
//        }
//        
//        if let maxPhi = maxPhi {
//            phi = min(phi, maxPhi)
//        }
//        
//        var z = currentCoord.z + velocity.z * translation.y
//        
//        if let minZ = minZ {
//            z = max(z, minZ)
//        }
//        
//        if let maxZ = maxZ {
//            z = min(z, maxZ)
//        }
//        
//        currentCoord.r = r
//        currentCoord.phi = phi
//        currentCoord.z = z
//    }
//    
//    func moveToPosition(_ position: GLKVector3) -> Bool {
//        return false
//    }
//}
