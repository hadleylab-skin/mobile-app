//
//  Created by mutexre on 29/07/2017.
//  Copyright © 2017 mutexre. All rights reserved.
//

import UIKit
import SnapKit

@objc protocol ControlsViewDelegate {
    func didTap(controlsView: ControlsView, item: ControlsView.Item)
}

class ControlsView: UIView
{
    @objc enum Item: Int {
        case body
        case head
        case armR
        case armL
        case legR
        case legL
        case back
    }
    
    var delegate: ControlsViewDelegate?
    
    var selectedItem: Item?
    {
        didSet {
            guard oldValue != selectedItem else {
                return
            }
            
            if let item = selectedItem,
               let button = itemsButtons[item]
            {
                button.isSelected = true
            }

            if let item = oldValue,
               let button = itemsButtons[item]
            {
                button.isSelected = false
            }
        }
    }
    
    private lazy var stackView = UIStackView()
    private var selectedButton: UIButton?
    private var buttonsItems = [UIButton:Item]()
    private var itemsButtons = [Item:UIButton]()
    
    private func setup()
    {
        addSubview(stackView)
        
        stackView.alignment = .center
        stackView.distribution = .equalSpacing
        stackView.axis = .horizontal
//        stackView.spacing = 10
        
        let h = 40.0
        
        let items = [
            (Item.body, "body", h),
            (Item.head, "head", h),
            (Item.armR, "right-hand", h),
            (Item.armL, "left-hand", h),
            (Item.legR, "right-foot", h),
            (Item.legL, "left-foot", h),
            (Item.back, "reverse", 0.75 * h)
        ]
        
        for i in items
        {
            let button = UIButton()
            stackView.addArrangedSubview(button)
            
            let item = i.0
            let name = i.1
            let size = i.2
            
            button.setImage(UIImage(named: name), for: .normal)
            button.setImage(UIImage(named: name.appending("-selected")), for: .selected)
            button.addTarget(self, action: #selector(didTapButton(_:)), for: .touchUpInside)
            
            button.imageView?.contentMode = .scaleAspectFit;
            button.showsTouchWhenHighlighted = true
            
            button.snp.makeConstraints { (make) in
                make.width.height.equalTo(size)
            }
            
            buttonsItems[button] = item
            itemsButtons[item] = button
        }
        
        let marginV = 10
        let marginH = 7
        
        stackView.snp.makeConstraints { (make) in
            make.left.equalToSuperview().offset(marginH)
            make.right.equalToSuperview().offset(-marginH - 5)
            make.top.equalToSuperview().offset(marginV)
            make.bottom.equalToSuperview().offset(-marginV)
        }
        
//        if let first = stackView.arrangedSubviews.first as? UIButton {
//            selectButton(first)
//        }
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        setup()
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setup()
    }
    
//    private func selectButton(_ button: UIButton)
//    {
//        guard selectedButton != button else {
//            return
//        }
//        
//        button.isSelected = !button.isSelected
//        selectedButton?.isSelected = false
//        
//        selectedButton = button
//
//        guard let index = buttons[button] else {
//            return
//        }
//        
//        delegate?.didTap(controlsView: self, item: index)
//    }
    
    @objc private func didTapButton(_ sender: UIButton) {
//        selectButton(sender)
        guard let item = buttonsItems[sender] else {
            return
        }
        
        delegate?.didTap(controlsView: self, item: item)
    }
}
