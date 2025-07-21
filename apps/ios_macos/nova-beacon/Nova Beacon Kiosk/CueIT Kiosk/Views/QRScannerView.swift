import SwiftUI
import AVFoundation

struct QRScannerView: UIViewControllerRepresentable {
    let onCodeScanned: (String) -> Void
    let onCancel: () -> Void
    
    func makeUIViewController(context: Context) -> QRScannerViewController {
        let controller = QRScannerViewController()
        controller.delegate = context.coordinator
        return controller
    }
    
    func updateUIViewController(_ uiViewController: QRScannerViewController, context: Context) {
        // No updates needed
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, QRScannerViewControllerDelegate {
        let parent: QRScannerView
        
        init(_ parent: QRScannerView) {
            self.parent = parent
        }
        
        func qrScannerDidScanCode(_ code: String) {
            parent.onCodeScanned(code)
        }
        
        func qrScannerDidCancel() {
            parent.onCancel()
        }
    }
}

protocol QRScannerViewControllerDelegate: AnyObject {
    func qrScannerDidScanCode(_ code: String)
    func qrScannerDidCancel()
}

class QRScannerViewController: UIViewController {
    weak var delegate: QRScannerViewControllerDelegate?
    
    private var captureSession: AVCaptureSession!
    private var previewLayer: AVCaptureVideoPreviewLayer!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupCamera()
        setupUI()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        if !captureSession.isRunning {
            DispatchQueue.global(qos: .userInitiated).async {
                self.captureSession.startRunning()
            }
        }
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        
        if captureSession.isRunning {
            captureSession.stopRunning()
        }
    }
    
    private func setupCamera() {
        captureSession = AVCaptureSession()
        
        guard let videoCaptureDevice = AVCaptureDevice.default(for: .video) else {
            showAlert(title: "Error", message: "Camera not available")
            return
        }
        
        let videoInput: AVCaptureDeviceInput
        
        do {
            videoInput = try AVCaptureDeviceInput(device: videoCaptureDevice)
        } catch {
            showAlert(title: "Error", message: "Failed to access camera")
            return
        }
        
        if captureSession.canAddInput(videoInput) {
            captureSession.addInput(videoInput)
        } else {
            showAlert(title: "Error", message: "Could not add video input")
            return
        }
        
        let metadataOutput = AVCaptureMetadataOutput()
        
        if captureSession.canAddOutput(metadataOutput) {
            captureSession.addOutput(metadataOutput)
            
            metadataOutput.setMetadataObjectsDelegate(self, queue: DispatchQueue.main)
            metadataOutput.metadataObjectTypes = [.qr]
        } else {
            showAlert(title: "Error", message: "Could not add metadata output")
            return
        }
        
        previewLayer = AVCaptureVideoPreviewLayer(session: captureSession)
        previewLayer.frame = view.layer.bounds
        previewLayer.videoGravity = .resizeAspectFill
        view.layer.addSublayer(previewLayer)
    }
    
    private func setupUI() {
        view.backgroundColor = UIColor.black
        
        // Cancel button
        let cancelButton = UIButton(type: .system)
        cancelButton.setTitle("Cancel", for: .normal)
        cancelButton.setTitleColor(.white, for: .normal)
        cancelButton.titleLabel?.font = UIFont.systemFont(ofSize: 18, weight: .medium)
        cancelButton.backgroundColor = UIColor.black.withAlphaComponent(0.7)
        cancelButton.layer.cornerRadius = 8
        cancelButton.addTarget(self, action: #selector(cancelTapped), for: .touchUpInside)
        
        cancelButton.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(cancelButton)
        
        // Instructions label
        let instructionsLabel = UILabel()
        instructionsLabel.text = "Point camera at QR code to scan"
        instructionsLabel.textColor = .white
        instructionsLabel.font = UIFont.systemFont(ofSize: 16, weight: .medium)
        instructionsLabel.textAlignment = .center
        instructionsLabel.backgroundColor = UIColor.black.withAlphaComponent(0.7)
        instructionsLabel.layer.cornerRadius = 8
        instructionsLabel.layer.masksToBounds = true
        
        instructionsLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(instructionsLabel)
        
        // Constraints
        NSLayoutConstraint.activate([
            cancelButton.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 20),
            cancelButton.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            cancelButton.widthAnchor.constraint(equalToConstant: 80),
            cancelButton.heightAnchor.constraint(equalToConstant: 44),
            
            instructionsLabel.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -20),
            instructionsLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            instructionsLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            instructionsLabel.heightAnchor.constraint(equalToConstant: 44)
        ])
    }
    
    @objc private func cancelTapped() {
        delegate?.qrScannerDidCancel()
    }
    
    private func showAlert(title: String, message: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
            self.delegate?.qrScannerDidCancel()
        })
        present(alert, animated: true)
    }
}

extension QRScannerViewController: AVCaptureMetadataOutputObjectsDelegate {
    func metadataOutput(_ output: AVCaptureMetadataOutput, didOutput metadataObjects: [AVMetadataObject], from connection: AVCaptureConnection) {
        if let metadataObject = metadataObjects.first {
            guard let readableObject = metadataObject as? AVMetadataMachineReadableCodeObject else { return }
            guard let stringValue = readableObject.stringValue else { return }
            
            AudioServicesPlaySystemSound(SystemSoundID(kSystemSoundID_Vibrate))
            delegate?.qrScannerDidScanCode(stringValue)
        }
    }
}
