// Encodes rendered PNG frames as a silent, web-ready H.264 MP4 using macOS AVFoundation.
import Foundation
import AVFoundation
import AppKit
import CoreVideo
import CoreMedia
import ImageIO
let folder=URL(fileURLWithPath:CommandLine.arguments[1],isDirectory:true)
let destination=URL(fileURLWithPath:CommandLine.arguments[2])
let width=768,height=960,fps:Int32=24,count=240
if FileManager.default.fileExists(atPath:destination.path){try FileManager.default.removeItem(at:destination)}
let writer=try AVAssetWriter(outputURL:destination,fileType:.mp4)
writer.shouldOptimizeForNetworkUse=true
let settings:[String:Any]=[
 AVVideoCodecKey:AVVideoCodecType.h264,
 AVVideoWidthKey:width,AVVideoHeightKey:height,
 AVVideoCompressionPropertiesKey:[AVVideoAverageBitRateKey:2_400_000,AVVideoProfileLevelKey:AVVideoProfileLevelH264HighAutoLevel,AVVideoMaxKeyFrameIntervalKey:48]
]
let input=AVAssetWriterInput(mediaType:.video,outputSettings:settings)
input.expectsMediaDataInRealTime=false
let adapter=AVAssetWriterInputPixelBufferAdaptor(assetWriterInput:input,sourcePixelBufferAttributes:[kCVPixelBufferPixelFormatTypeKey as String:kCVPixelFormatType_32ARGB,kCVPixelBufferWidthKey as String:width,kCVPixelBufferHeightKey as String:height,kCVPixelBufferCGImageCompatibilityKey as String:true,kCVPixelBufferCGBitmapContextCompatibilityKey as String:true])
writer.add(input)
guard writer.startWriting() else{fatalError("Cannot start writer: \(String(describing:writer.error))")}
writer.startSession(atSourceTime:.zero)
for index in 0..<count{
 while !input.isReadyForMoreMediaData{Thread.sleep(forTimeInterval:0.005)}
 autoreleasepool{
  let file=folder.appendingPathComponent(String(format:"%04d.png",index))
  guard let source=CGImageSourceCreateWithURL(file as CFURL,nil),let image=CGImageSourceCreateImageAtIndex(source,0,nil) else{fatalError("Missing frame \(index)")}
  var buffer:CVPixelBuffer?
  guard CVPixelBufferPoolCreatePixelBuffer(nil,adapter.pixelBufferPool!,&buffer)==kCVReturnSuccess, let pixel=buffer else{fatalError("No pixel buffer")}
  CVPixelBufferLockBaseAddress(pixel,[])
  let context=CGContext(data:CVPixelBufferGetBaseAddress(pixel),width:width,height:height,bitsPerComponent:8,bytesPerRow:CVPixelBufferGetBytesPerRow(pixel),space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.noneSkipFirst.rawValue)!
  context.draw(image,in:CGRect(x:0,y:0,width:width,height:height))
  CVPixelBufferUnlockBaseAddress(pixel,[])
  guard adapter.append(pixel,withPresentationTime:CMTime(value:Int64(index),timescale:fps)) else{fatalError("Append failed: \(String(describing:writer.error))")}
 }
 if index%48==0{print("Encoded \(index)/\(count)")}
}
input.markAsFinished()
let done=DispatchSemaphore(value:0)
writer.finishWriting{done.signal()}
done.wait()
guard writer.status == .completed else{fatalError("Encode failed: \(String(describing:writer.error))")}
print("MP4 ready: \(destination.path)")
