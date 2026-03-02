// @ts-nocheck
import { useState, useRef, useEffect } from "preact/hooks";
import { ModalProps } from "../../controllers/modals/types";
import { Header, Button, Modal } from "@revoltchat/ui";
import { Text } from "preact-i18n";

export interface ImageCropperProps extends ModalProps<"image_cropper"> {
    file: File;
    aspectRatio?: number;
    title?: string;
    onCallback: (file: File) => void;
}

export function ImageCropperModal({ file, aspectRatio = 1, title = "Crop Image", onCallback, ...props }: ImageCropperProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [imageUrl, setImageUrl] = useState<string>("");

    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });

    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    useEffect(() => {
        console.log("ImageCropperModal mounted for file:", file.name);
        const url = URL.createObjectURL(file);
        setImageUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [file]);

    const CROP_SIZE = 280; // Fixed size for the crop area

    // Helper to clamp values
    const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

    // Calculate bounds based on current zoom
    const getBounds = (currentZoom: number) => {
        if (!imageRef.current) return { minX: 0, maxX: 0, minY: 0, maxY: 0, minZoom: 0.1 };
        
        const img = imageRef.current;
        const cropW = CROP_SIZE * (aspectRatio || 1);
        const cropH = CROP_SIZE;

        const minZoom = Math.max(cropW / img.naturalWidth, cropH / img.naturalHeight);
        
        const imgW = img.naturalWidth * currentZoom;
        const imgH = img.naturalHeight * currentZoom;

        const maxX = Math.max(0, (imgW - cropW) / 2);
        const maxY = Math.max(0, (imgH - cropH) / 2);

        return { minX: -maxX, maxX, minY: -maxY, maxY, minZoom };
    };

    // Initialize zoom and pan when image loads
    const onImageLoad = (e: any) => {
        const img = e.currentTarget;
        const container = containerRef.current;
        if (!img || !container) return;

        const bounds = getBounds(1); // tentative call
        const initialScale = bounds.minZoom;

        setZoom(initialScale);
        setPan({ x: 0, y: 0 }); 
    };

    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY * -0.001;
        const bounds = getBounds(zoom);
        const nextZoom = clamp(zoom + delta, bounds.minZoom, 10);
        
        setZoom(nextZoom);
        
        // Re-clamp pan after zoom change
        const nextBounds = getBounds(nextZoom);
        setPan(prev => ({
            x: clamp(prev.x, nextBounds.minX, nextBounds.maxX),
            y: clamp(prev.y, nextBounds.minY, nextBounds.maxY)
        }));
    };

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
            return () => container.removeEventListener('wheel', handleWheel);
        }
    }, [zoom, pan]);

    const handleMouseDown = (e: any) => {
        setIsDragging(true);
        dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    };

    const handleMouseMove = (e: any) => {
        if (!isDragging) return;
        const bounds = getBounds(zoom);
        setPan({
            x: clamp(e.clientX - dragStart.current.x, bounds.minX, bounds.maxX),
            y: clamp(e.clientY - dragStart.current.y, bounds.minY, bounds.maxY)
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const cropImage = async () => {
        if (!imageRef.current || !canvasRef.current || !containerRef.current) return;

        const image = imageRef.current;
        const canvas = canvasRef.current;
        const container = containerRef.current;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const containerRect = container.getBoundingClientRect();
        
        // Output size
        canvas.width = 512;
        canvas.height = 512 / (aspectRatio || 1);

        const imgNaturalWidth = image.naturalWidth;
        const imgNaturalHeight = image.naturalHeight;

        // The crop area is CROP_SIZE x CROP_SIZE in the center of container.
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;
        
        const cropLeft = centerX - (CROP_SIZE * (aspectRatio || 1)) / 2;
        const cropTop = centerY - CROP_SIZE / 2;

        // Image position: center + pan - (size/2)
        const imgLeft = centerX + pan.x - (imgNaturalWidth * zoom) / 2;
        const imgTop = centerY + pan.y - (imgNaturalHeight * zoom) / 2;

        const relativeX = (cropLeft - imgLeft) / zoom;
        const relativeY = (cropTop - imgTop) / zoom;
        const relativeWidth = (CROP_SIZE * (aspectRatio || 1)) / zoom;
        const relativeHeight = CROP_SIZE / zoom;

        ctx.drawImage(
            image,
            relativeX,
            relativeY,
            relativeWidth,
            relativeHeight,
            0,
            0,
            canvas.width,
            canvas.height
        );

        canvas.toBlob((blob) => {
            if (blob) {
                const croppedFile = new File([blob], file.name, { type: file.type || "image/png" });
                onCallback(croppedFile);
                props.onClose();
            }
        }, file.type || "image/png");
    };

    const isAvatar = title?.toLowerCase().includes('avatar');

    return (
        <Modal {...props} maxWidth="500px">
        <div style={{ backgroundColor: 'var(--background-secondary)', display: 'flex', flexDirection: 'column', borderRadius: '12px', overflow: 'hidden' }}>
            <Header placement="primary">
                <div style={{ padding: '8px 4px' }}><Text id={title} /></div>
            </Header>

            <div 
                ref={containerRef}
                style={{ 
                    width: '100%', 
                    height: '380px', 
                    position: 'relative', 
                    overflow: 'hidden', 
                    cursor: isDragging ? 'grabbing' : 'grab',
                    backgroundColor: '#0a0a0a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {imageUrl && (
                    <img
                        ref={imageRef}
                        src={imageUrl}
                        draggable={false}
                        onLoad={onImageLoad}
                        style={{
                            position: 'absolute',
                            width: 'auto',
                            height: 'auto',
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                            transformOrigin: 'center',
                            pointerEvents: 'none',
                            userSelect: 'none'
                        }}
                    />
                )}
                
                {/* Visual Overlay - Darken everything outside CROP_SIZE */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        width: CROP_SIZE * (aspectRatio || 1),
                        height: CROP_SIZE,
                        border: '2px solid rgba(255, 255, 255, 0.4)',
                        borderRadius: isAvatar ? '50%' : '4px',
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                        position: 'absolute'
                    }} />
                </div>
            </div>

            <div style={{ padding: '20px', backgroundColor: 'var(--background-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                    <i className="fas fa-search-minus" style={{ color: 'var(--foreground-muted)' }} />
                    <input 
                        type="range" 
                        min="0.05" 
                        max="3" 
                        step="0.001" 
                        value={zoom} 
                        onChange={(e) => {
                            const val = parseFloat(e.currentTarget.value);
                            const bounds = getBounds(val);
                            const nextZoom = Math.max(val, bounds.minZoom);
                            setZoom(nextZoom);
                            
                            const nextBounds = getBounds(nextZoom);
                            setPan(prev => ({
                                x: clamp(prev.x, nextBounds.minX, nextBounds.maxX),
                                y: clamp(prev.y, nextBounds.minY, nextBounds.maxY)
                            }));
                        }}
                        style={{ 
                            flex: 1,
                            accentColor: 'var(--accent)',
                            height: '6px',
                            borderRadius: '3px',
                            appearance: 'none',
                            background: 'var(--background-tertiary)'
                        }}
                    />
                    <i className="fas fa-search-plus" style={{ color: 'var(--foreground-muted)' }} />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <Button palette="secondary" onClick={props.onClose} style={{ borderRadius: '4px', padding: '8px 20px' }}>
                        <Text id="app.special.modals.actions.cancel" />
                    </Button>
                    <Button onClick={cropImage} style={{ borderRadius: '4px', padding: '8px 24px' }}>
                        <Text id="app.special.modals.actions.save" />
                    </Button>
                </div>
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
        </Modal>
    );
}
