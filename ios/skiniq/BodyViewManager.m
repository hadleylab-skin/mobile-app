//
//  Created by mutexre on 14/08/2017.
//  Copyright © 2017 mutexre. All rights reserved.
//

#import <React/RCTBridge.h>
#import <React/RCTViewManager.h>
#import <React/RCTEventEmitter.h>
#import <JavaScriptCore/JSContext.h>
#import "skiniq-Swift.h"
#import "BodyViewManager.h"

@interface BodyViewManager : RCTViewManager<BodyViewDelegate>
@end

@implementation BodyViewManager

RCT_EXPORT_MODULE()

@synthesize bridge = _bridge;

- (UIView *)view
{
  BodyView3D* view = [BodyView3D new];
  view.delegate = self;
  return view;
}

+ (NSDictionary*)nevusDict:(Nevus*)nevus
{
  return @{
    @"id": nevus.id,
    @"anatomicalSite": nevus.bodyNode.displayName,
    @"faceIndex": @(nevus.faceIndex),
    @"positionX": @(nevus.coord.x),
    @"positionY": @(nevus.coord.y),
    @"positionZ": @(nevus.coord.z)
  };
}

RCT_EXPORT_VIEW_PROPERTY(sex, NSString);
RCT_EXPORT_VIEW_PROPERTY(moles, NSArray);

- (void)bodyView:(BodyView3D*)bodyView bodyNodeSelected:(NSString*)bodyNodeName
{
  RCTEventEmitter* eventEmitter = [_bridge moduleForName: EVENT_EMITTER_CLASS];
  [eventEmitter sendEventWithName: BODY_PART_SELECTED_EVENT body: @{
    @"name": bodyNodeName
  }];
}

- (void)bodyView:(BodyView3D*)bodyView nevusAdded:(Nevus*)nevus
{
  RCTEventEmitter* eventEmitter = [_bridge moduleForName: EVENT_EMITTER_CLASS];
  NSDictionary* dict = [BodyViewManager nevusDict:nevus];
  [eventEmitter sendEventWithName: MOLE_ADDED_EVENT body: dict];
}

- (void)bodyView:(BodyView3D*)bodyView nevusSelected:(Nevus*)nevus
{
  RCTEventEmitter* eventEmitter = [_bridge moduleForName: EVENT_EMITTER_CLASS];
  NSDictionary* dict = [BodyViewManager nevusDict:nevus];
  [eventEmitter sendEventWithName: MOLE_SELECTED_EVENT body: dict];
}

@end
