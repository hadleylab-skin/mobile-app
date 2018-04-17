//
//  BodyView3D+Gestures.swift
//  Skin
//
//  Created by Alexander Obuschenko on 17/04/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

import SceneKit

extension BodyView3D
{
    @objc internal func handlePan(_ pan: UIPanGestureRecognizer)
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
  
    @objc internal func handlePinch(_ pinch: UIPinchGestureRecognizer)
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
  
    @objc internal func handleTap(_ tap: UIGestureRecognizer)
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
      
        hitResults.forEach {
            let name = $0.node.name ?? "-"
        }
      
        let selectedNevus = nevusHitTest(hitResults)
        if let nevus = selectedNevus {
            delegate?.bodyView(self, nevusSelected: nevus)
            newNevus = nil
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
                lookAtCameraTarget(target)
            }
            else
            {
                handleHitHigh(r.bodyNode, r.hitTestResult, didSelectNevus)
            }
        }
        else if selectedBodyNodeLO == currentModel.rootBodyNode,
                let r = findNearestChildNodeInHitTestResults(hitResults, relativeTo: currentModel.rootBodyNode),
                (r.bodyNode.name == "Posterior Neck" ||
                 r.bodyNode.name == "Anterior Neck" ||
                 r.bodyNode.name == "Middle Chest")
        {
            handleHitHigh(r.bodyNode, r.hitTestResult, didSelectNevus)
        }
        else
        {
            if selectedBodyNodeLO == currentModel.rootBodyNode,
               let r = findNearestChildNodeInHitTestResults(hitResults, relativeTo: currentModel.rootBodyNode),
               let item = findControlsViewItem(r.bodyNode),
               let target = currentModel.cameraTargets[item]
            {
                controlsView.selectedItem = item
                lookAtCameraTarget(target)
            }
        }
    }
}
