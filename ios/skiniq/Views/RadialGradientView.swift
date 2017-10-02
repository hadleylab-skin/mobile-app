//
//  Created by mutexre on 21/08/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

import QuartzCore
import UIKit

class RadialGradientLayer: CALayer
{
    var center: CGPoint {
        return CGPoint(x: bounds.width/2, y: bounds.height/2)
    }

    var radius: CGFloat {
        return (bounds.width + bounds.height)/2
    }

    var colors: [UIColor] = [.black, .lightGray] {
        didSet {
            setNeedsDisplay()
        }
    }

    var locations: [Float] = [0, 1] {
        didSet {
            setNeedsDisplay()
        }
    }

    private var cgColors: [CGColor] {
        return colors.map({ (color) -> CGColor in
            return color.cgColor
        })
    }

    private var cgLocations: [CGFloat] {
        return locations.map({ (location) -> CGFloat in
            return CGFloat(location)
        })
    }

    override init() {
        super.init()
        needsDisplayOnBoundsChange = true
    }

    required init(coder aDecoder: NSCoder) {
        super.init()
    }

    override init(layer: Any) {
        super.init(layer: layer)
    }

    override func draw(in ctx: CGContext) {
        ctx.saveGState()
        let colorSpace = CGColorSpaceCreateDeviceRGB()
        guard let gradient = CGGradient(colorsSpace: colorSpace, colors: cgColors as CFArray, locations: cgLocations) else {
            return
        }
        ctx.drawRadialGradient(gradient, startCenter: center, startRadius: 0.0, endCenter: center, endRadius: radius, options: CGGradientDrawingOptions(rawValue: 0))
    }

}

class RadialGradientView: UIView {

    private let gradientLayer = RadialGradientLayer()

    var colors: [UIColor] {
        get {
            return gradientLayer.colors
        }
        set {
            gradientLayer.colors = newValue
        }
    }

    var locations: [Float] {
        get {
            return gradientLayer.locations
        }
        set {
            gradientLayer.locations = newValue
        }
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        if gradientLayer.superlayer == nil {
            layer.insertSublayer(gradientLayer, at: 0)
        }
        gradientLayer.frame = bounds
    }

}
