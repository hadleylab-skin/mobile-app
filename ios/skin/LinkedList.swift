//
//  LinkedList.swift
//  skiniq
//
//  Created by mutexre on 25/08/2017.
//  Copyright © 2017 Facebook. All rights reserved.
//

import Foundation

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
