//
//  RNSecretManager.m
//

#import <Security/Security.h>
#import "RNSecretManager.h"
#import <React/RCTConvert.h>
#import <React/RCTBridge.h>
#import <React/RCTUtils.h>

@implementation RNSecretManager

@synthesize bridge = _bridge;
RCT_EXPORT_MODULE();

NSString *messageForError(NSError *error)
{
  switch (error.code) {
    case errSecUnimplemented:
      return @"Function or operation not implemented.";
      
    case errSecIO:
      return @"I/O error.";
      
    case errSecOpWr:
      return @"File already open with with write permission.";
      
    case errSecParam:
      return @"One or more parameters passed to a function where not valid.";
      
    case errSecAllocate:
      return @"Failed to allocate memory.";
      
    case errSecUserCanceled:
      return @"User canceled the operation.";
      
    case errSecBadReq:
      return @"Bad parameter or invalid state for operation.";
      
    case errSecNotAvailable:
      return @"No keychain is available. You may need to restart your computer.";
      
    case errSecDuplicateItem:
      return @"The specified item already exists in the keychain.";
      
    case errSecItemNotFound:
      return @"The specified item could not be found in the keychain.";
      
    case errSecInteractionNotAllowed:
      return @"User interaction is not allowed.";
      
    case errSecDecode:
      return @"Unable to decode the provided data.";
      
    case errSecAuthFailed:
      return @"The user name or passphrase you entered is not correct.";
      
    default:
      return error.localizedDescription;
  }
}

NSString *codeForError(NSError *error)
{
  return [NSString stringWithFormat:@"%li", (long)error.code];
}


void rejectWithError(RCTPromiseRejectBlock reject, NSError *error)
{
  return reject(codeForError(error), messageForError(error), nil);
}

RCT_EXPORT_METHOD(getKeyPair:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSDictionary *query =
  @{
    (__bridge id)kSecClass                : (__bridge id)kSecClassInternetPassword,
    (__bridge id)kSecAttrComment          : kKeyPairComment,
    (__bridge id)kSecAttrLabel            : kKeyPairLabel,
    (__bridge id)kSecReturnData           : @YES,
    (__bridge id)kSecReturnAttributes     : @YES,
    (__bridge id)kSecAttrSynchronizable   : @YES,
    };
  
  CFTypeRef outTypeRef = NULL;
  
  OSStatus osStatus = SecItemCopyMatching((__bridge CFDictionaryRef)query, &outTypeRef);
  
  if (osStatus != noErr && osStatus != errSecItemNotFound) {
    NSError *error = [NSError errorWithDomain:NSOSStatusErrorDomain code:osStatus userInfo:nil];
    return rejectWithError(reject, error);
  }
  
  NSDictionary *itemInfo = (__bridge NSDictionary *)(outTypeRef);
  if (!itemInfo) {
    return resolve(@(NO));
  }
  
  
  NSString *publicKey = itemInfo[(__bridge id)kSecAttrAccount];
  NSString *privateKey = [[NSString alloc] initWithData:itemInfo[(__bridge id)kSecValueData]
                                               encoding:NSUTF8StringEncoding];
  
  return resolve(@{
                   @"public": publicKey,
                   @"private": privateKey
                   });
}

RCT_EXPORT_METHOD(saveKeyPair:(NSString *)publicKey withPrivateKey:(NSString *)privateKey resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSDictionary *query =
  @{
    (__bridge id)kSecClass                : (__bridge id)kSecClassInternetPassword,
    (__bridge id)kSecAttrComment          : kKeyPairComment,
    (__bridge id)kSecAttrLabel            : kKeyPairLabel,
    (__bridge id)kSecReturnData           : @NO,
    (__bridge id)kSecAttrSynchronizable   : (__bridge id)kSecAttrSynchronizableAny,
    };
  
  NSData *secret = [privateKey dataUsingEncoding:NSUTF8StringEncoding];

  NSDictionary *prepayload =
  @{
    (__bridge id)kSecAttrAccessible       : (__bridge id)(kSecAttrAccessibleWhenUnlocked),
    (__bridge id)kSecAttrComment          : kKeyPairComment,
    (__bridge id)kSecAttrAccount          : publicKey,
    (__bridge id)kSecValueData            : secret,
    (__bridge id)kSecAttrSynchronizable   : @YES,
    };
  
  NSMutableDictionary *payload = [NSMutableDictionary dictionaryWithDictionary:prepayload];
  
  OSStatus findStatus = SecItemCopyMatching((__bridge CFDictionaryRef)query, NULL);
  if (findStatus == errSecItemNotFound)
  {
    // None found. Add a new one
    NSMutableDictionary *attributes = [NSMutableDictionary dictionary];
    [attributes addEntriesFromDictionary:query];
    [attributes addEntriesFromDictionary:payload];
    
    [attributes removeObjectForKey:(__bridge id)kSecReturnData];
    
    OSStatus osStatus = SecItemAdd((__bridge CFDictionaryRef)attributes, NULL);
    
    if (osStatus != errSecSuccess)
    {
      NSError *error = [NSError errorWithDomain:NSOSStatusErrorDomain code:osStatus userInfo:nil];
      return rejectWithError(reject, error);
    }
    return resolve(@(YES));
  } else if (findStatus == errSecSuccess)
  {
    // Existing one found. Update it
    OSStatus osStatus = SecItemUpdate((__bridge CFDictionaryRef)query, (__bridge CFDictionaryRef)payload);
    
    if (osStatus != errSecSuccess)
    {
      // We have a problem
      NSError *error = [NSError errorWithDomain:NSOSStatusErrorDomain code:osStatus userInfo:nil];
      return rejectWithError(reject, error);
    }
    return resolve(@(YES));
  } else {
    NSError *error = [NSError errorWithDomain:NSOSStatusErrorDomain code:findStatus userInfo:nil];
    return rejectWithError(reject, error);
  }
}

@end
