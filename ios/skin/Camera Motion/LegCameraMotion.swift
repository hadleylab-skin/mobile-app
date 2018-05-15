//
//  Created by mutexre on 21/08/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

import SceneKit

class LegCameraMotion: CameraMotion
{
    struct Config
    {
        var origin: GLKVector3
        var axisZ: GLKVector3
        var axisY: GLKVector3
        var r: Float
        var cylinderH: Float
        var torusR: Float
        var angle: Float
        var targetPoints: [TargetPoint]
    }
    
    var r: Float
    var cylinderH: Float
    var angle: Float
    var targetPoints: [TargetPoint]
  
    var position: GLKVector3 {
        return currentMotionController.position
    }

    var nativePosition: GLKVector3
    {
        get {
            return currentMotionController.nativePosition
        }
        
        set {
            if var motion = currentMotionController {
                motion.nativePosition = newValue
            }
        }
    }

    var target: GLKVector3 {
        return getCurrentTarget(x: distance)
    }

    var pivot: GLKMatrix4 {
        return currentMotionController.pivot
    }
  
    var zoomMode: CameraZoomMode = .fov

    var initialFov: Double?
    var minFov: Double?
    var maxFov: Double?
    
    var up: GLKVector3?
    var upFunc: UpFunc?
    var targetFunc: TargetFunc?
  
    private var cylinder: CylindricalMotion
    private var torus: ToroidalMotion
    private var hemisphere: SphericalMotion
  
    private var currentMotionController: CameraMotion!
    {
        switch segment
        {
        case .cylinder:
            return cylinder
            
        case .torus:
            return torus
            
        case .hemisphere:
            return hemisphere
        }
    }
    
    private enum Segment
    {
        case cylinder
        case torus
        case hemisphere
    }
    
    private var segment: Segment
  
    init(origin: GLKVector3,
         axisZ: GLKVector3,
         axisY: GLKVector3,
         cylinderH: Float,
         torusR: Float,
         r: Float,
         angle: Float,
         initialFov: Double,
         minFov: Double,
         maxFov: Double,
         targetPoints: [(Float, GLKVector3)])
    {
        self.r = r
        self.cylinderH = cylinderH
        self.angle = angle
        self.initialFov = initialFov
        self.minFov = minFov
        self.maxFov = maxFov
        self.targetPoints = targetPoints
      
        let cylinderUp = GLKVector3MultiplyScalar(axisZ, -1)
        let torusUp = cylinderUp //GLKVector3MultiplyScalar(GLKVector3Add(axisZ, axisY), -1)
      
        cylinder = CylindricalMotion(origin: origin,
                                     axisZ: axisZ,
                                     axisR: axisY,
                                     up: cylinderUp,
                                     minR: r,
                                     maxR: r,
                                     minZ: 0,
                                     maxZ: cylinderH,
                                     initialCoord: (r: r, phi: 0, z: 0),
                                     velocity: (r: 0, phi: -0.015, z: -0.02))
        
        torus = ToroidalMotion(origin: cylinder.end!,
                               dirToCenter: axisY,
                               dir: axisZ,
                               r1: torusR,
                               minR2: r,
                               maxR2: r,
                               minTheta: 0,
                               maxTheta: angle,
                               initialCoord: (r2: r, theta: 0, phi: 0),
                               velocity: (r2: 0, theta: 0.0025, phi: 0.01))
      
        let hemisphereThetaAxis = torus.getRadiusVector(theta: angle)
        let hemispherePhiAxis = torus.getTangentVector(theta: angle)
        let hemisphereUp = GLKVector3MultiplyScalar(hemispherePhiAxis, -1) //torusUp
      
        hemisphere = SphericalMotion(center: torus.end!,
                                     axisTheta: hemisphereThetaAxis,
                                     axisPhi: hemispherePhiAxis,
                                     up: hemisphereUp,
                                     minR: r,
                                     maxR: r,
                                     minTheta: 0.15 * Float.pi / 2,
                                     maxTheta: Float.pi / 2,
                                     initialCoord: (r: r, theta: 0, phi: 0),
                                     velocity: (r: 0, theta: -0.01, phi: -0.01))
      
        segment = .cylinder
        
        torus.upFunc = { (pos: GLKVector3, nativePos: GLKVector3) -> GLKVector3 in
            let rv = GLKVector3Subtract(pos, self.torus.center)
            return GLKVector3CrossProduct(rv, self.torus.axisZ)
        }
        
        let targetFunc = { (pos: GLKVector3, nativePos: GLKVector3) -> GLKVector3 in
            return self.target
        }
        
        cylinder.targetFunc = targetFunc
        torus.targetFunc = targetFunc
        hemisphere.targetFunc = targetFunc
    }
  
    private func getCurrentTarget(x: Float) -> GLKVector3
    {
        let a = targetPoints.reversed().first(where: { $0.0 <= x }) ?? targetPoints.first
        let b = targetPoints.first(where: { $0.0 >= x }) ?? targetPoints.last
    
        if a!.0 == b!.0 {
            return a!.1
        }
    
        let pos = (x - a!.0) / (b!.0 - a!.0)
        
        return mix(a: a!.1, b: b!.1, x: pos)
    }
  
    private func mix(a: GLKVector3, b: GLKVector3, x: Float) -> GLKVector3 {
        return GLKVector3Add(a, GLKVector3MultiplyScalar(GLKVector3Subtract(b, a), x))
    }
  
    func reset() {
        segment = .cylinder
        currentMotionController.reset()
    }
  
    func toggleFrontBack() {
        currentMotionController.toggleFrontBack()
    }
  
    func move(_ translation: GLKVector3) -> GLKVector3
    {
        let dxyz = currentMotionController.move(translation)
      
        guard dxyz.x != 0 || dxyz.y != 0 else {
            return GLKVector3Make(0, 0, 0)
        }
      
        switch segment
        {
        case .cylinder:
            if dxyz.y > 0
            {
                segment = .torus
                torus.nativePosition = GLKVector3Make(-cylinder.nativePosition.x + Float.pi, 0, r)
            }
        
        case .torus:
            if dxyz.y < 0 {
                segment = .cylinder
                cylinder.nativePosition = GLKVector3Make(-torus.nativePosition.x + Float.pi, cylinderH, r)
            }
            else if dxyz.y > 0 {
                segment = .hemisphere
                hemisphere.nativePosition = GLKVector3Make(-torus.nativePosition.x + Float.pi / 2, Float.pi / 2, r)
            }
        
        case .hemisphere:
            if dxyz.y > 0 {
                segment = .torus
                torus.nativePosition = GLKVector3Make(-hemisphere.nativePosition.x + Float.pi / 2, angle, r)
            }
        }
      
        return GLKVector3Make(0, 0, 0)
    }

    private var distance: Float
    {
        switch segment
        {
        case .cylinder:
            return (cylinder.nativePosition.y - cylinder.minZ!) / (cylinder.maxZ! - cylinder.minZ!)
        
        case .torus:
            return 1 + (torus.nativePosition.y - torus.minTheta!) / (torus.maxTheta! - torus.minTheta!)
        
        case .hemisphere:
            return 3 - (hemisphere.nativePosition.y - hemisphere.minTheta!) / (hemisphere.maxTheta! - hemisphere.minTheta!)
        }
    }

    func getRepresentationVertexGroups(z: Float, nx: Int, ny: Int) -> [[GLKVector3]]
    {
        return [ cylinder, torus, hemisphere ].flatMap { (motion: CameraMotion) in
            return motion.getRepresentationVertexGroups(z: r, nx: nx, ny: ny)
        }
    }
}
