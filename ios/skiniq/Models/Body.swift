//
//  Created by mutexre on 14/08/2017.
//  Copyright © 2017 mutexre. All rights reserved.
//

import SceneKit

enum BodyModelError: Error {
    case invalidPlist
}

class Body
{
    var name: String
    var file: String?

    var root: BodyNode?
    
// MARK: -
    
    init(_ plist: [String:Any]) throws
    {
        guard let name = plist[nameKey] as? String,
              let file = plist[fileKey] as? String,
              let sites = plist[sitesKey] as? [[String:Any]]
        else {
            throw BodyModelError.invalidPlist
        }
        
        self.name = name
        
        for site in sites
        {
            guard let name = site[nodeNameKey] as? String,
                  let displayName = site[displayNameKey] as? String
            else {
                continue
            }
            
            
        }
    }
    
    static func load() -> [String:Body]
    {
        var models: [String:Body] = [:]
        
        for modelName in [ "Male" ]
        {
            guard let file = Bundle.main.path(forResource: modelName, ofType: "plist"),
                  let plist = NSDictionary(contentsOfFile: file) as? [String:Any]
            else {
                continue
            }
        
            let model = try! Body(plist)
            models[modelName] = model
        }
        
        return models
    }
    
// MARK: -
    
    private var nodesBySCNNode: [SCNNode:BodyNode] = [:]
    private var nodesByName: [String:BodyNode] = [:]
    
    private var selectedBodyNodeLO: BodyNode! {
        didSet {
//            updateBodyNodeLabel()
        }
    }
    
    private var selectedBodyNodeHI: BodyNode? {
        didSet {
//            updateBodyNodeLabel()
        }
    }
    
    private var bodyNodesByNode = [SCNNode:BodyNode]()
    private var bodyNodesByName = [String:BodyNode]()
    
    private var nevi = Set<Nevus>()
    private var neviByNode = [SCNNode:Nevus]()
    
    private var selectedNevus: Nevus? {
        didSet {
//            showContinueToCloseUpPhotoButton = (selectedNevus != nil)
        }
    }
    
    private let commonRootNode = SCNNode()
    private var bodyRootNode: SCNNode!
    private let neviRootNode = SCNNode()
    
    private let nameKey = "Name"
    private let fileKey = "File"
    private let sitesKey = "Sites"
    private let nodeNameKey = "Name"
    private let displayNameKey = "Display name"
}
