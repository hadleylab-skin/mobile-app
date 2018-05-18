//
//  BodyView3D+ControlsView.swift
//  Skin
//
//  Created by Alexander Obuschenko on 17/04/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

import SceneKit

extension BodyView3D: ControlsViewDelegate
{
    func didTap(controlsView: ControlsView, item: ControlsView.Item)
    {
        guard let currentModel = currentModel else {
            return
        }
      
        if item == .back
        {
            if let bodyNode = selectedBodyNodeLO,
               let cameraMotion = bodyNode.cameraMotion
            {
                cameraMotion.toggleFrontBack()
                cameraMotion.updateNode(cameraNode)
            }
            return
        }
        else
        {
            guard let target = currentModel.cameraTargets[item] else {
                return
            }
          
            lookAtCameraTarget(target)
        }
    }
}
