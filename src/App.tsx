/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Folder, 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Home, 
  User, 
  Briefcase, 
  MessageSquare, 
  Share2, 
  ThumbsUp, 
  MoreHorizontal,
  Search,
  Bell,
  Menu,
  Layout,
  Clock,
  ExternalLink,
  Send,
  Trash2,
  Globe,
  Heart,
  Camera,
  Plus,
  X,
  Image as ImageIcon,
  Smile,
  Check,
  Phone,
  Mail,
  MapPin,
  Upload,
  RefreshCw,
  Volume2,
  VolumeX,
  Pin
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to check if a URL is a video
const isVideo = (url: string) => {
  if (!url) return false;
  return url.startsWith('data:video/') || 
         /\.(mp4|webm|ogg|mov)$/i.test(url.split('?')[0]);
};

// Image Upload Modal Component
interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string) => void;
  onSaveMultiple?: (urls: string[]) => void;
  currentUrl: string;
  title: string;
  aspectRatio?: "circle" | "rect";
  allowMultiple?: boolean;
}

const ImageUploadModal = ({ isOpen, onClose, onSave, onSaveMultiple, currentUrl, title, aspectRatio = "circle", allowMultiple = false }: ImageUploadModalProps) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [tempUrl, setTempUrl] = useState(currentUrl);
  const [multipleUrls, setMultipleUrls] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setTempUrl(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (allowMultiple && files.length > 1) {
        const urls: string[] = [];
        let processed = 0;
        Array.from(files as FileList).forEach((file: File) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            urls.push(reader.result as string);
            processed++;
            if (processed === files.length) {
              setMultipleUrls(urls);
              setTempUrl(urls[0]); // Preview first one
            }
          };
          reader.readAsDataURL(file);
        });
      } else {
        const file = files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
          setTempUrl(reader.result as string);
          setMultipleUrls([]);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  useEffect(() => {
    if (isOpen) setTempUrl(currentUrl);
    return () => {
      if (isCameraActive) stopCamera();
    };
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-bold text-xl">{title}</h2>
          <button 
            onClick={() => {
              onClose();
              if (isCameraActive) stopCamera();
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-center">
            <div className={cn(
              "border-4 border-gray-100 overflow-hidden bg-gray-50 relative group",
              aspectRatio === "circle" ? "w-48 h-48 rounded-full" : "w-full aspect-video rounded-xl"
            )}>
              {isCameraActive ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : tempUrl ? (
                isVideo(tempUrl) ? (
                  <video 
                    src={tempUrl} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img 
                    src={tempUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/150?text=Invalid+URL")}
                    referrerPolicy="no-referrer"
                  />
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                  <ImageIcon size={48} strokeWidth={1} className="mb-2 opacity-20" />
                  <p className="text-xs font-medium">No media selected</p>
                </div>
              )}
              
              {isCameraActive && (
                <button 
                  onClick={capturePhoto}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all"
                >
                  <Camera size={24} />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 py-2.5 rounded-xl font-bold text-sm transition-all"
            >
              <Upload size={18} />
              Upload Media
            </button>
            <button 
              onClick={isCameraActive ? stopCamera : startCamera}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all",
                isCameraActive ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-gray-100 hover:bg-gray-200"
              )}
            >
              <Camera size={18} />
              {isCameraActive ? "Cancel Camera" : "Use Camera"}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/jpeg,image/png,image/gif,image/webp,image/avif,video/mp4" 
              multiple={allowMultiple}
              className="hidden" 
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400">Or use URL</span>
            </div>
          </div>

          <div>
            <input 
              type="text" 
              value={tempUrl.startsWith('data:') ? '' : tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => {
                onClose();
                if (isCameraActive) stopCamera();
              }}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                if (allowMultiple && multipleUrls.length > 0 && onSaveMultiple) {
                  onSaveMultiple(multipleUrls);
                } else {
                  onSave(tempUrl);
                }
                onClose();
                if (isCameraActive) stopCamera();
                setMultipleUrls([]);
              }}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface Slide {
  id: number;
  title: string;
  img: string;
  duration?: number;
}

interface CoverPhotoManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  slides: Slide[];
  onSave: (slides: Slide[]) => void;
}

const CoverPhotoManagerModal = ({ isOpen, onClose, slides, onSave }: CoverPhotoManagerModalProps) => {
  const [localSlides, setLocalSlides] = useState<Slide[]>(slides);
  const [isAddingMedia, setIsAddingMedia] = useState(false);

  useEffect(() => {
    if (isOpen) setLocalSlides(slides);
  }, [isOpen, slides]);

  const handleAddMedia = (urls: string[]) => {
    const newSlides = urls.map((url, index) => ({
      id: Date.now() + index,
      title: "New Slide",
      img: url,
      duration: 5000
    }));
    setLocalSlides([...localSlides, ...newSlides]);
  };

  const handleRemoveSlide = (id: number) => {
    setLocalSlides(localSlides.filter(s => s.id !== id));
  };

  const handleUpdateDuration = (id: number, duration: number) => {
    setLocalSlides(localSlides.map(s => s.id === id ? { ...s, duration } : s));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-bold text-xl text-gray-900">Manage Cover Slides</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto no-scrollbar">
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-500">Drag to reorder slides. Set duration in milliseconds.</p>
            <button 
              onClick={() => setIsAddingMedia(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-all"
            >
              <Plus size={18} />
              Add Media
            </button>
          </div>

          <Reorder.Group axis="y" values={localSlides} onReorder={setLocalSlides} className="space-y-4 pt-2">
            {localSlides.map((slide, index) => (
              <Reorder.Item key={slide.id} value={slide}>
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-200 group relative hover:border-blue-300 transition-colors">
                  <div className="absolute -left-2 -top-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-md z-10">
                    {index + 1}
                  </div>
                  <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-blue-500 transition-colors">
                    <Menu size={20} />
                  </div>
                  <div className="w-24 aspect-video rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-200">
                    {slide.img ? (
                      isVideo(slide.img) ? (
                        <video src={slide.img} className="w-full h-full object-cover" />
                      ) : (
                        <img src={slide.img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <input 
                      type="text" 
                      value={slide.title}
                      onChange={(e) => {
                        setLocalSlides(localSlides.map(s => s.id === slide.id ? { ...s, title: e.target.value } : s));
                      }}
                      className="w-full bg-transparent border-none font-bold text-sm text-gray-900 focus:ring-0 p-0 truncate"
                      placeholder="Slide Title"
                    />
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-gray-400" />
                        <input 
                          type="number" 
                          value={slide.duration || 5000}
                          onChange={(e) => handleUpdateDuration(slide.id, parseInt(e.target.value) || 0)}
                          className="w-20 bg-white border border-gray-200 rounded px-2 py-0.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                          step={500}
                        />
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">ms</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveSlide(slide.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove Slide"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onSave(localSlides);
              onClose();
            }}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            Save Changes
          </button>
        </div>
      </motion.div>

      <ImageUploadModal 
        isOpen={isAddingMedia}
        onClose={() => setIsAddingMedia(false)}
        onSave={(url) => handleAddMedia([url])}
        onSaveMultiple={handleAddMedia}
        currentUrl=""
        title="Add Media to Slides"
        aspectRatio="rect"
        allowMultiple={true}
      />
    </div>
  );
};

// Mock Data
const PROJECTS = [
  {
    id: 1,
    title: "Modern House Design & DA Approval",
    date: "March 20, 2026",
    images: ["https://picsum.photos/seed/house1/1200/600", "https://picsum.photos/seed/house2/1200/600", "https://picsum.photos/seed/house3/1200/600"],
    description: "Complete architectural design for a contemporary family home. Successfully secured DA approval through meticulous documentation and planning.",
    category: "Residential",
    layout: "carousel",
    comments: [
      { id: 1, author: "John Smith", text: "Amazing design! Love the use of glass.", date: "1 day ago", status: 'approved' },
      { id: 2, author: "Sarah Jones", text: "How long did the DA process take?", date: "5 hours ago", status: 'pending' }
    ]
  },
  {
    id: 2,
    title: "Retail Shop Fit-out & CDC Application",
    date: "February 15, 2026",
    images: ["https://picsum.photos/seed/shop1/1200/600"],
    description: "Innovative shop design for a local boutique. Managed the entire CDC application process to ensure a smooth and timely fit-out.",
    category: "Commercial",
    layout: "carousel",
    comments: []
  },
  {
    id: 3,
    title: "Luxury Kitchen Renovation",
    date: "January 25, 2026",
    images: ["https://picsum.photos/seed/kitchen1/1200/600", "https://picsum.photos/seed/kitchen2/1200/600", "https://picsum.photos/seed/kitchen3/1200/600"],
    description: "Custom kitchen design focusing on ergonomics and high-end finishes. Provided full project management from demolition to final installation.",
    category: "Interior",
    layout: "carousel",
    comments: [
      { id: 3, author: "Mike Ross", text: "The finishes are top notch.", date: "1 week ago", status: 'approved' }
    ]
  },
  {
    id: 4,
    title: "CC Documentation for Multi-Unit Development",
    date: "December 10, 2025",
    images: ["https://picsum.photos/seed/construction1/1200/600"],
    description: "Detailed Construction Certificate (CC) documentation for a 5-unit residential development, ensuring compliance with all building codes.",
    category: "Documentation",
    layout: "carousel",
    comments: []
  }
];

const SLIDES = [
  { id: 1, title: "Expert House, Shop & Kitchen Design", img: "https://picsum.photos/seed/design1/1920/1080", duration: 5000 },
  { id: 2, title: "DA, CC & CDC Application Specialists", img: "https://picsum.photos/seed/planning1/1920/1080", duration: 5000 },
  { id: 3, title: "Professional Project Management Services", img: "https://picsum.photos/seed/pm1/1920/1080", duration: 5000 },
];

// Components
const TreeItem = ({ icon: Icon, label, active }: { icon: any, label: string, active?: boolean }) => (
  <div className={cn(
    "flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer transition-colors rounded-md mx-2",
    active ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
  )}>
    <Icon size={16} />
    <span>{label}</span>
  </div>
);

const FolderView = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <details open={defaultOpen} onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)} className="group">
      <summary className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 cursor-pointer hover:bg-gray-800 rounded-md mx-2">
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <Folder size={16} className="text-blue-400" />
        <span>{title}</span>
      </summary>
      <div className="ml-4 border-l border-gray-700 my-1">
        {children}
      </div>
    </details>
  );
};

interface MediaReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  onSave: (newImages: string[]) => void;
}

const MediaReorderModal: React.FC<MediaReorderModalProps> = ({ isOpen, onClose, images, onSave }) => {
  const [localImages, setLocalImages] = useState<{id: string, url: string}[]>([]);

  useEffect(() => {
    if (isOpen) {
      setLocalImages(images.map((url, i) => ({ id: `img-${i}-${url}`, url })));
    }
  }, [isOpen, images]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-bold text-xl text-gray-900">Reorder Media</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto no-scrollbar">
          <p className="text-sm text-gray-500 mb-4">Drag items to change their display order in the post.</p>
          <Reorder.Group axis="y" values={localImages} onReorder={setLocalImages} className="space-y-3">
            {localImages.map((item, index) => (
              <Reorder.Item key={item.id} value={item}>
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-200 group relative hover:border-blue-300 transition-colors">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">
                    {index + 1}
                  </div>
                  <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-blue-500 transition-colors">
                    <Menu size={20} />
                  </div>
                  <div className="w-20 aspect-video rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-200">
                    {item.url ? (
                      isVideo(item.url) ? (
                        <video src={item.url} className="w-full h-full object-cover" />
                      ) : (
                        <img src={item.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      )
                    ) : (
                      <div className="w-full h-full bg-gray-50" />
                    )}
                  </div>
                  <div className="flex-1 truncate text-xs text-gray-500 font-mono">
                    {item.url.split('/').pop()}
                  </div>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onSave(localImages.map(item => item.url));
              onClose();
            }}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            Apply Order
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ProjectCard = ({ 
  project, 
  isAdmin, 
  profileImage, 
  onUpdateProject, 
  onDeleteProject,
  onUpdateComment,
  onDeleteComment,
  unmutedId,
  setUnmutedId,
  onTogglePin,
  volume,
  setVolume
}: { 
  project: typeof PROJECTS[0] & { isPinned?: boolean }, 
  isAdmin?: boolean, 
  profileImage: string,
  onUpdateProject: (project: typeof PROJECTS[0]) => void,
  onDeleteProject: (id: number) => void,
  onUpdateComment: (projectId: number, comment: any) => void,
  onDeleteComment: (projectId: number, commentId: number) => void,
  unmutedId: string | number | null,
  setUnmutedId: (id: string | number | null) => void,
  onTogglePin: (id: number) => void,
  volume: number,
  setVolume: (v: number) => void
}) => {
  const [likes, setLikes] = useState(Math.floor(Math.random() * 100));
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [isReorderingMedia, setIsReorderingMedia] = useState(false);
  const [editTitle, setEditTitle] = useState(project.title);
  const [editDescription, setEditDescription] = useState(project.description);
  const [editImages, setEditImages] = useState(project.images || []);
  const [editLayout, setEditLayout] = useState(project.layout || 'grid');
  const [isUpdatingEditImage, setIsUpdatingEditImage] = useState(false);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  
  // Comment edit state
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  
  // Menu state
  const [showMenu, setShowMenu] = useState(false);
  
  // Expanded view state
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  useEffect(() => {
    if (expandedIndex !== null) {
      setUnmutedId(project.id);
    }
  }, [expandedIndex, project.id, setUnmutedId]);
  
  const isMuted = unmutedId !== project.id;

  const handleSaveEdit = () => {
    onUpdateProject({
      ...project,
      title: editTitle,
      description: editDescription,
      images: editImages,
      layout: editLayout
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(project.title);
    setEditDescription(project.description);
    setEditImages(project.images || []);
    setEditLayout(project.layout || 'grid');
    setIsEditing(false);
  };

  const handleAddEditImage = () => {
    setEditingImageIndex(null);
    setIsUpdatingEditImage(true);
  };

  const handleReplaceEditImage = (index: number) => {
    setEditingImageIndex(index);
    setIsUpdatingEditImage(true);
  };

  const handleRemoveEditImage = (index: number) => {
    setEditImages(editImages.filter((_, i) => i !== index));
  };

  const handleEditComment = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.text);
  };

  const handleSaveCommentEdit = (comment: any) => {
    onUpdateComment(project.id, {
      ...comment,
      text: editCommentText
    });
    setEditingCommentId(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden"
    >
      {/* Card Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex-shrink-0 overflow-hidden">
            {profileImage ? (
              <img src={profileImage} alt="Multiview Logo" className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                <User size={20} />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h3 className="font-bold text-gray-900 leading-tight hover:underline cursor-pointer">Multiview Design & Pm</h3>
              <div className="bg-blue-600 text-white rounded-full p-0.5">
                <Check size={8} strokeWidth={4} />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {project.isPinned && (
                <div className="flex items-center gap-1 text-blue-600 font-bold mr-1">
                  <Pin size={10} className="rotate-45" />
                  <span className="text-[10px] uppercase tracking-wider">Pinned</span>
                  <span>•</span>
                </div>
              )}
              <span>{project.date}</span>
              <span>•</span>
              <Globe size={12} />
            </div>
          </div>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2 relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              <MoreHorizontal size={20} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-[60] overflow-hidden py-1">
                <button 
                  onClick={() => {
                    onTogglePin(project.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Pin size={16} className={cn("text-blue-600", !project.isPinned && "rotate-45")} />
                  <span className="font-semibold">{project.isPinned ? "Unpin Post" : "Pin to Top"}</span>
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw size={16} className="text-blue-600" />
                  <span className="font-semibold">Edit Post</span>
                </button>
                <button 
                  onClick={() => {
                    onDeleteProject(project.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                  <span className="font-semibold">Delete Post</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="px-4 pb-3">
        {isEditing ? (
          <div className="space-y-3">
            <input 
              type="text" 
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea 
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
            <div className="flex gap-2">
              <button 
                onClick={handleSaveEdit}
                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
              <button 
                onClick={handleCancelEdit}
                className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
            
            {/* Layout Selector in Edit Mode */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                {['carousel', 'grid', 'verticals'].map((l) => (
                  <button
                    key={l}
                    onClick={() => setEditLayout(l)}
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                      editLayout === l ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
              {editImages.length > 1 && (
                <button 
                  onClick={() => setIsReorderingMedia(true)}
                  className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all"
                >
                  <RefreshCw size={12} />
                  Reorder
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <h4 className="font-bold text-gray-900 mb-1">{project.title}</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              {project.description}
            </p>
          </>
        )}
      </div>

      {/* Card Media Grid / Carousel */}
      <div className="relative bg-gray-100 group/image">
        {isEditing ? (
          <div className="grid grid-cols-2 gap-1 p-1">
            {editImages.map((img, index) => (
              <div key={index} className="relative aspect-square rounded overflow-hidden group">
                {isVideo(img) ? (
                  <video src={img} className="w-full h-full object-cover" />
                ) : (
                  <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    onClick={() => handleReplaceEditImage(index)}
                    className="p-2 bg-white rounded-full text-blue-600 hover:bg-blue-50 shadow-lg"
                  >
                    <RefreshCw size={16} />
                  </button>
                  <button 
                    onClick={() => handleRemoveEditImage(index)}
                    className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 shadow-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            <button 
              onClick={handleAddEditImage}
              className="aspect-square border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all"
            >
              <Plus size={24} />
              <span className="text-[10px] font-bold">Add Media</span>
            </button>
          </div>
        ) : (
          <>
            {project.layout === 'carousel' ? (
              <div className="relative aspect-video">
                <Swiper
                  modules={[Navigation, Pagination]}
                  spaceBetween={0}
                  slidesPerView={1}
                  navigation={{
                    nextEl: `.swiper-button-next-${project.id}`,
                    prevEl: `.swiper-button-prev-${project.id}`,
                  }}
                  pagination={{ clickable: true }}
                  className="w-full h-full"
                >
                  {project.images.map((img, index) => (
                    <SwiperSlide key={index}>
                      <div className="relative w-full h-full">
                        {img ? (
                          isVideo(img) ? (
                            <video src={img} className="w-full h-full object-cover" autoPlay loop muted={isMuted} playsInline />
                          ) : (
                            <img src={img} alt={`${project.title} - ${index}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          )
                        ) : (
                          <div className="w-full h-full bg-gray-50" />
                        )}
                      </div>
                    </SwiperSlide>
                  ))}
                  
                  {/* Custom Navigation Buttons */}
                  {project.images.length > 1 && (
                    <>
                      <button className={cn(`swiper-button-prev-${project.id}`, "absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover/image:opacity-100")}>
                        <ChevronRight className="rotate-180" size={18} />
                      </button>
                      <button className={cn(`swiper-button-next-${project.id}`, "absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover/image:opacity-100")}>
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}
                </Swiper>
              </div>
            ) : project.layout === 'verticals' ? (
              <div className="grid grid-cols-3 gap-0.5 aspect-video overflow-hidden">
                {project.images.slice(0, 3).map((img, index) => (
                  <div 
                    key={index} 
                    className="relative h-full overflow-hidden cursor-pointer group/media"
                    onClick={() => setExpandedIndex(index)}
                  >
                    {img ? (
                      isVideo(img) ? (
                        <video src={img} className="w-full h-full object-cover" autoPlay loop muted={isMuted} playsInline />
                      ) : (
                        <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      )
                    ) : (
                      <div className="w-full h-full bg-gray-50" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover/media:bg-black/10 transition-colors" />
                  </div>
                ))}
              </div>
            ) : (
              <div className={cn(
                "grid gap-0.5 overflow-hidden",
                project.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
              )}>
                {project.images.slice(0, 4).map((img, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "relative overflow-hidden cursor-pointer group/media",
                      project.images.length === 1 ? "aspect-video" : 
                      project.images.length === 3 && index === 0 ? "row-span-2 aspect-auto" : "aspect-square"
                    )}
                    onClick={() => setExpandedIndex(index)}
                  >
                    {img ? (
                      isVideo(img) ? (
                        <video src={img} className="w-full h-full object-cover" autoPlay loop muted={isMuted} playsInline />
                      ) : (
                        <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      )
                    ) : (
                      <div className="w-full h-full bg-gray-50" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover/media:bg-black/10 transition-colors" />
                    {project.images.length > 4 && index === 3 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-2xl font-bold">
                        +{project.images.length - 4}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Global Sound Control for the post */}
            {project.images.some(img => isVideo(img)) && (
              <div className="absolute bottom-4 right-4 z-20 flex flex-col-reverse items-center group/sound">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setUnmutedId(isMuted ? project.id : null);
                  }}
                  className="w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all shadow-lg"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={20} /> : (volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />)}
                </button>
                <div className="h-0 opacity-0 group-hover/sound:h-32 group-hover/sound:opacity-100 transition-all duration-300 flex flex-col items-center bg-black/40 backdrop-blur-md rounded-full w-10 mb-2 py-4 overflow-hidden">
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={volume} 
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="[appearance:slider-vertical] w-1 h-full accent-white cursor-pointer"
                    style={{ appearance: 'slider-vertical' } as any}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Expanded Carousel View */}
      <AnimatePresence>
        {expandedIndex !== null && (
          <div className="fixed inset-0 bg-black/95 z-[200] flex flex-col">
            <div className="flex items-center justify-between p-4 text-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex-shrink-0 overflow-hidden">
                  {profileImage ? (
                    <img src={profileImage} alt="Logo" className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-gray-100" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold leading-tight">{project.title}</h3>
                  <p className="text-xs text-gray-400">{project.date}</p>
                </div>
              </div>
              <button 
                onClick={() => setExpandedIndex(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 relative flex items-center justify-center">
              <Swiper
                modules={[Navigation, Pagination]}
                initialSlide={expandedIndex}
                spaceBetween={0}
                slidesPerView={1}
                navigation={{
                  nextEl: `.swiper-button-next-expanded-${project.id}`,
                  prevEl: `.swiper-button-prev-expanded-${project.id}`,
                }}
                pagination={{ clickable: true, type: 'fraction' }}
                className="w-full h-full"
              >
                {project.images.map((img, index) => (
                  <SwiperSlide key={index}>
                    <div className="w-full h-full flex items-center justify-center p-4 md:p-12">
                      {img ? (
                        isVideo(img) ? (
                          <video 
                            src={img} 
                            className="max-w-full max-h-full object-contain shadow-2xl" 
                            controls 
                            autoPlay 
                            muted={isMuted}
                            playsInline 
                          />
                        ) : (
                          <img 
                            src={img} 
                            alt={`${project.title} - ${index}`} 
                            className="max-w-full max-h-full object-contain shadow-2xl" 
                            referrerPolicy="no-referrer" 
                          />
                        )
                      ) : (
                        <div className="w-full h-full bg-gray-900" />
                      )}
                    </div>
                  </SwiperSlide>
                ))}
                
                {/* Custom Navigation Buttons */}
                {project.images.length > 1 && (
                  <>
                    <button className={cn(`swiper-button-prev-expanded-${project.id}`, "absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all")}>
                      <ChevronRight className="rotate-180" size={24} />
                    </button>
                    <button className={cn(`swiper-button-next-expanded-${project.id}`, "absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all")}>
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </Swiper>
            </div>
          </div>
        )}
      </AnimatePresence>

      <MediaReorderModal 
        isOpen={isReorderingMedia}
        onClose={() => setIsReorderingMedia(false)}
        images={editImages}
        onSave={setEditImages}
      />

      <ImageUploadModal 
        isOpen={isUpdatingEditImage}
        onClose={() => setIsUpdatingEditImage(false)}
        onSave={(url) => {
          if (editingImageIndex !== null) {
            const newImages = [...editImages];
            newImages[editingImageIndex] = url;
            setEditImages(newImages);
          } else {
            setEditImages([...editImages, url]);
          }
        }}
        currentUrl={editingImageIndex !== null ? editImages[editingImageIndex] : ""}
        title={editingImageIndex !== null ? "Replace Media" : "Add Media"}
        aspectRatio="rect"
      />

      {/* Card Stats */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-gray-100 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="bg-blue-500 text-white p-1 rounded-full">
            <ThumbsUp size={10} />
          </div>
          <span>{isLiked ? likes + 1 : likes}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowComments(!showComments)} className="hover:underline">
            {project.comments.length} comments
          </button>
          <span>{Math.floor(Math.random() * 10)} shares</span>
        </div>
      </div>

      {/* Card Actions */}
      <div className="px-2 py-1 flex items-center justify-around">
        <button 
          onClick={() => setIsLiked(!isLiked)}
          className={cn(
            "flex items-center gap-2 px-2 py-2 rounded-lg transition-colors flex-1 justify-center",
            isLiked ? "text-blue-600" : "text-gray-600 hover:bg-gray-100"
          )}
        >
          <ThumbsUp size={18} />
          <span className="font-semibold text-sm">Like</span>
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-2 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-1 justify-center"
        >
          <MessageSquare size={18} />
          <span className="font-semibold text-sm">Comment</span>
        </button>
        <button className="flex items-center gap-2 px-2 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-1 justify-center">
          <MessageSquare size={18} className="text-blue-500" />
          <span className="font-semibold text-sm">Send</span>
        </button>
        <button className="flex items-center gap-2 px-2 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-1 justify-center">
          <Share2 size={18} />
          <span className="font-semibold text-sm">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {(showComments || project.comments.length > 0) && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          <div className="space-y-4 mt-2">
            {project.comments.map(comment => (
              <div key={comment.id} className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?u=${comment.id + 50}`} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block max-w-full">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-gray-900">{comment.author}</span>
                      {comment.status === 'pending' && (
                        <span className="bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Pending Review
                        </span>
                      )}
                    </div>
                    {editingCommentId === comment.id ? (
                      <div className="mt-1 space-y-2">
                        <textarea 
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleSaveCommentEdit(comment)}
                            className="text-blue-600 font-bold text-xs hover:underline"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setEditingCommentId(null)}
                            className="text-gray-500 font-bold text-xs hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-800">{comment.text}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 ml-2">
                    <button className="font-bold hover:underline">Like</button>
                    <button className="font-bold hover:underline">Reply</button>
                    <span>{comment.date}</span>
                    {isAdmin && (
                      <div className="flex gap-2 ml-2">
                        {comment.status === 'pending' && (
                          <button 
                            onClick={() => onUpdateComment(project.id, { ...comment, status: 'approved' })}
                            className="text-green-600 font-bold hover:underline"
                          >
                            Approve
                          </button>
                        )}
                        <button 
                          onClick={() => handleEditComment(comment)}
                          className="text-blue-600 font-bold hover:underline"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => onDeleteComment(project.id, comment.id)}
                          className="text-red-600 font-bold hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comment Input */}
          <div className="flex gap-2 mt-4">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2 text-gray-500">
                <ImageIcon size={16} className="cursor-pointer hover:text-gray-700" />
                <Smile size={16} className="cursor-pointer hover:text-gray-700" />
              </div>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 ml-10 italic">
            * Comments are moderated to ensure a professional environment.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('Posts');
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileImage, setProfileImage] = useState("https://graph.facebook.com/61585525116819/picture?type=large");
  const [slides, setSlides] = useState(SLIDES);
  const [projects, setProjects] = useState(PROJECTS);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isReorderingPostMedia, setIsReorderingPostMedia] = useState(false);
  const [isUpdatingProfileImage, setIsUpdatingProfileImage] = useState(false);
  const [isUpdatingCoverImage, setIsUpdatingCoverImage] = useState(false);
  const [isUpdatingPostImage, setIsUpdatingPostImage] = useState(false);
  const [creatingPostImageIndex, setCreatingPostImageIndex] = useState<number | null>(null);
  const [newPost, setNewPost] = useState({ title: '', description: '', images: [] as string[], layout: 'carousel' });
  const [unmutedId, setUnmutedId] = useState<string | number | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [messageForm, setMessageForm] = useState({ name: '', phone: '', email: '', content: '' });
  
  // Contact Settings
  const [contactEmail, setContactEmail] = useState("multiviewdesigns@gmail.com");
  const [confirmationTitle, setConfirmationTitle] = useState("Thanks for reaching out!");
  const [confirmationBody, setConfirmationBody] = useState("We've received your message and will get back to you shortly.");
  const [isEditingContactSettings, setIsEditingContactSettings] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, phone, email, content } = messageForm;
    const subject = `Message from ${name} via Multiview Design App`;
    const body = `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\n\nMessage:\n${content}`;
    
    // Create mailto link
    const mailtoLink = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Show confirmation
    setIsMessageSent(true);
  };

  useEffect(() => {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      video.volume = volume;
    });
  }, [volume, unmutedId, projects, slides]);

  const handleTogglePin = (id: number) => {
    setProjects(projects.map(p => p.id === id ? { ...p, isPinned: !p.isPinned } : p));
  };

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.description) return;
    
    const post = {
      id: Date.now(),
      title: newPost.title,
      description: newPost.description,
      images: newPost.images.length > 0 ? newPost.images : [`https://picsum.photos/seed/${Date.now()}/1200/600`],
      date: "Just now",
      category: "New Project",
      layout: newPost.layout,
      comments: []
    };
    
    setProjects([post, ...projects]);
    setNewPost({ title: '', description: '', images: [], layout: 'carousel' });
    setIsCreatingPost(false);
  };

  const handleDeletePost = (id: number) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const handleUpdateProfileImage = () => {
    setIsUpdatingProfileImage(true);
  };

  const handleUpdateCoverImage = () => {
    setIsUpdatingCoverImage(true);
  };

  const handleUpdatePostImage = () => {
    setCreatingPostImageIndex(null);
    setIsUpdatingPostImage(true);
  };

  const handleReplacePostImage = (index: number) => {
    setCreatingPostImageIndex(index);
    setIsUpdatingPostImage(true);
  };

  const handleRemovePostImage = (index: number) => {
    setNewPost({
      ...newPost,
      images: newPost.images.filter((_, i) => i !== index)
    });
  };

  const handleUpdateProject = (updatedProject: typeof PROJECTS[0]) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleUpdateComment = (projectId: number, updatedComment: any) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          comments: p.comments.map(c => c.id === updatedComment.id ? updatedComment : c)
        };
      }
      return p;
    }));
  };

  const handleDeleteComment = (projectId: number, commentId: number) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          comments: p.comments.filter(c => c.id !== commentId)
        };
      }
      return p;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="h-14 bg-white border-b border-gray-200 sticky top-0 z-50 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-2xl tracking-tighter overflow-hidden">
            {profileImage ? (
              <img src={profileImage} alt="Logo" className="w-full h-full object-contain p-1 bg-white" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-white" />
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Facebook" 
              className="bg-gray-100 rounded-full py-2 pl-10 pr-4 w-40 md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-1 h-full">
          {['Home', 'Video', 'Marketplace', 'Groups', 'Gaming'].map((item, i) => (
            <button key={item} className={cn(
              "px-8 h-full border-b-4 transition-all hover:bg-gray-100",
              i === 0 ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"
            )}>
              <div className="w-6 h-6 flex items-center justify-center">
                {i === 0 && <Home size={24} />}
                {i === 1 && <Layout size={24} />}
                {i === 2 && <Briefcase size={24} />}
                {i === 3 && <User size={24} />}
                {i === 4 && <Plus size={24} />}
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsAdmin(!isAdmin)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
              isAdmin ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-blue-100 text-blue-600 hover:bg-blue-200"
            )}
          >
            {isAdmin ? "Logout Admin" : "Login as Admin"}
          </button>
          <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <Menu size={20} />
          </button>
          <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <Bell size={20} />
          </button>
          <div className="w-10 h-10 rounded-full bg-gray-200 ml-2 overflow-hidden border border-gray-200">
             {profileImage ? (
               <img src={profileImage} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
             ) : (
               <div className="w-full h-full bg-gray-200" />
             )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden justify-center bg-[#f0f2f5]">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1035px] mx-auto w-full bg-white shadow-sm">
            
            {/* Top Section - Cover Photo */}
            <section className="relative w-full aspect-[21/9] md:aspect-[2.7/1] bg-gray-200 overflow-hidden rounded-b-xl group">
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                navigation={{
                  nextEl: '.swiper-button-next-custom',
                  prevEl: '.swiper-button-prev-custom',
                }}
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                className="w-full h-full"
              >
                {slides.map((slide) => (
                  <SwiperSlide key={slide.id} data-swiper-autoplay={slide.duration || 5000}>
                    <div className="relative w-full h-full">
                      {slide.img ? (
                        isVideo(slide.img) ? (
                          <video 
                            src={slide.img} 
                            className="w-full h-full object-cover"
                            autoPlay
                            loop
                            muted={unmutedId !== 'cover'}
                            playsInline
                          />
                        ) : (
                          <img 
                            src={slide.img} 
                            alt={slide.title} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                  </SwiperSlide>
                ))}
                
                {/* Custom Navigation Buttons */}
                <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all">
                  <ChevronRight className="rotate-180" size={24} />
                </button>
                <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all">
                  <ChevronRight size={24} />
                </button>

                {/* Cover Sound Control */}
                {slides.some(s => isVideo(s.img)) && (
                  <div className="absolute bottom-4 right-4 z-30 flex flex-col-reverse items-center group/sound">
                    <button 
                      onClick={() => setUnmutedId(unmutedId === 'cover' ? null : 'cover')}
                      className="w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all shadow-lg"
                      title={unmutedId === 'cover' ? "Mute Cover" : "Unmute Cover"}
                    >
                      {unmutedId === 'cover' ? (volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />) : <VolumeX size={20} />}
                    </button>
                    <div className="h-0 opacity-0 group-hover/sound:h-32 group-hover/sound:opacity-100 transition-all duration-300 flex flex-col items-center bg-black/20 backdrop-blur-md rounded-full w-10 mb-2 py-4 overflow-hidden">
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={volume} 
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="[appearance:slider-vertical] w-1 h-full accent-white cursor-pointer"
                        style={{ appearance: 'slider-vertical' } as any}
                      />
                    </div>
                  </div>
                )}
              </Swiper>

              {isAdmin && (
                <button 
                  onClick={handleUpdateCoverImage}
                  className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-white/90 hover:bg-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Camera size={18} />
                  Edit Cover Photo
                </button>
              )}
            </section>

            {/* Profile Bar */}
            <div className="px-4 md:px-8 pb-4 flex flex-col md:flex-row items-center md:items-start gap-4 relative z-20">
              <div className="relative group -mt-12 md:-mt-16">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden shadow-lg bg-white">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-gray-50" />
                  )}
                </div>
                {isAdmin && (
                  <button 
                    onClick={handleUpdateProfileImage}
                    className="absolute bottom-2 right-2 p-2 bg-gray-200 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-300 transition-all shadow-md"
                  >
                    <Camera size={20} />
                  </button>
                )}
              </div>
              <div className="flex-1 text-center md:text-left pt-1 md:pt-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Multiview Design & Pm</h1>
                <div className="text-gray-900 font-bold text-sm md:text-base mt-1 space-y-0.5">
                  <p>We design house, shop, and kitchen – documentation DA, CC, CDC application</p>
                  <p>Provide project management services</p>
                </div>
              </div>
              <div className="flex gap-2 pt-1 md:pt-2">
                {isAdmin && (
                  <button 
                    onClick={() => setIsCreatingPost(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md"
                  >
                    <Plus size={18} />
                    Add to Story
                  </button>
                )}
              </div>
            </div>

            {/* Content Tabs */}
            <div className="border-t border-gray-200 px-4 md:px-8 flex justify-between items-center">
              <div className="flex gap-1 overflow-x-auto no-scrollbar">
                {['Posts', 'About', 'Mentions', 'Reviews', 'Followers', 'More'].map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-4 py-4 font-semibold text-sm whitespace-nowrap border-b-4 transition-colors",
                      activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:bg-gray-100 rounded-md"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button className="bg-gray-200 p-2 rounded-lg text-gray-700 hover:bg-gray-300">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>

          <div className="max-w-[1035px] mx-auto w-full mt-4 pb-12 px-4 md:px-0">
            {/* Main Content Sections */}
            {activeTab === 'Posts' ? (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Left Column - Intro & Gallery */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Intro Section */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="space-y-4">
                      {isAdmin && (
                        <button className="w-full bg-gray-100 hover:bg-gray-200 py-2 rounded-lg font-semibold text-sm transition-colors">
                          Edit bio
                        </button>
                      )}
                      
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-3 text-gray-600">
                          <MapPin size={20} className="text-gray-400" />
                          <span className="text-sm font-semibold text-gray-900">23/61 Pine Rd Yennora NSW 2161</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <Phone size={20} className="text-gray-400" />
                          <span className="text-sm font-semibold text-gray-900">0424 995 989</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <Mail size={20} className="text-gray-400" />
                          <span className="text-sm font-semibold text-gray-900">multiviewdesigns@gmail.com</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <Globe size={20} className="text-gray-400" />
                          <span className="text-sm text-blue-600 hover:underline cursor-pointer">multiviewdesign.com.au</span>
                        </div>
                      </div>
                      
                      {isAdmin && (
                        <button className="w-full bg-gray-100 hover:bg-gray-200 py-2 rounded-lg font-semibold text-sm transition-colors">
                          Edit details
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Leave us a message Section */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <MessageSquare size={20} className="text-blue-600" />
                        Leave us a message
                      </h3>
                      {isAdmin && (
                        <button 
                          onClick={() => setIsEditingContactSettings(true)}
                          className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                          title="Contact Settings"
                        >
                          <RefreshCw size={16} />
                        </button>
                      )}
                    </div>
                    {isMessageSent ? (
                      <div className="bg-green-50 p-6 rounded-xl border border-green-100 text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Check size={24} />
                        </div>
                        <h4 className="font-bold text-green-900 mb-1">{confirmationTitle}</h4>
                        <p className="text-sm text-green-700">
                          {confirmationBody}
                        </p>
                        <button 
                          onClick={() => setIsMessageSent(false)}
                          className="mt-4 text-xs font-bold text-green-600 hover:underline uppercase tracking-wider"
                        >
                          Send another message
                        </button>
                      </div>
                    ) : (
                      <form className="space-y-3" onSubmit={handleSendMessage}>
                        <div>
                          <input 
                            type="text" 
                            placeholder="Your Name" 
                            required
                            value={messageForm.name}
                            onChange={e => setMessageForm({...messageForm, name: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <input 
                            type="tel" 
                            placeholder="Phone Number" 
                            value={messageForm.phone}
                            onChange={e => setMessageForm({...messageForm, phone: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <input 
                            type="email" 
                            placeholder="Email Address" 
                            required
                            value={messageForm.email}
                            onChange={e => setMessageForm({...messageForm, email: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <textarea 
                            placeholder="Your Message" 
                            rows={4}
                            required
                            value={messageForm.content}
                            onChange={e => setMessageForm({...messageForm, content: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                        </div>
                        <button 
                          type="submit"
                          className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                          <Send size={16} />
                          Send Message
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Gallery Grid */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center mb-4">
                      <button className="text-blue-600 text-sm font-medium hover:bg-blue-50 px-2 py-1 rounded">See all photos</button>
                    </div>
                    <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
                      {[1,2,3,4,5,6,7,8,9].map(i => (
                        <div key={i} className="aspect-square bg-gray-100">
                          <img src={`https://picsum.photos/seed/photo${i}/300/300`} alt="Gallery" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Feed */}
                <div className="lg:col-span-3 space-y-4">
                  {/* Create Post Mockup - Only for Admin */}
                  {isAdmin ? (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                      <div className="flex gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex-shrink-0 overflow-hidden">
                          {profileImage ? (
                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full bg-blue-600" />
                          )}
                        </div>
                        <button 
                          onClick={() => setIsCreatingPost(true)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-500 text-left px-4 py-2 rounded-full flex-1 transition-colors"
                        >
                          What's new at Multiview, Admin?
                        </button>
                      </div>
                      <div className="flex items-center justify-around border-t border-gray-100 pt-3">
                        <button 
                          onClick={() => setIsCreatingPost(true)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 font-medium text-sm"
                        >
                          <Layout size={18} className="text-red-500" />
                          Live Update
                        </button>
                        <button 
                          onClick={() => setIsCreatingPost(true)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 font-medium text-sm"
                        >
                          <ImageIcon size={18} className="text-green-500" />
                          Project Photo
                        </button>
                        <button 
                          onClick={() => setIsCreatingPost(true)}
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 font-medium text-sm"
                        >
                          <Clock size={18} className="text-yellow-500" />
                          Milestone
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Projects Feed */}
                  <div className="space-y-4">
                    {[...projects]
                      .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
                      .map((project) => (
                      <div key={project.id} className="relative">
                        <ProjectCard 
                          project={project} 
                          isAdmin={isAdmin} 
                          profileImage={profileImage}
                          onUpdateProject={handleUpdateProject}
                          onDeleteProject={handleDeletePost}
                          onUpdateComment={handleUpdateComment}
                          onDeleteComment={handleDeleteComment}
                          unmutedId={unmutedId}
                          setUnmutedId={setUnmutedId}
                          onTogglePin={handleTogglePin}
                          volume={volume}
                          setVolume={setVolume}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : activeTab === 'About' ? (
              <div className="p-6">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-4xl mx-auto">
                  <h2 className="text-2xl font-bold mb-6">About</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                      {['Overview', 'Work and education', 'Places lived', 'Contact and basic info', 'Family and relationships', 'Details about you', 'Life events'].map(item => (
                        <button key={item} className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 text-sm font-semibold text-gray-600">
                          {item}
                        </button>
                      ))}
                    </div>
                    <div className="md:col-span-2 space-y-6">
                      <div>
                        <h3 className="font-bold text-lg mb-4">Contact Info</h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Phone size={20} className="text-gray-400" />
                            <div>
                              <p className="text-gray-900 font-medium">0424 995 989</p>
                              <p className="text-xs text-gray-500">Mobile</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Mail size={20} className="text-gray-400" />
                            <div>
                              <p className="text-gray-900 font-medium">multiviewdesigns@gmail.com</p>
                              <p className="text-xs text-gray-500">Email</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Globe size={20} className="text-gray-400" />
                            <div>
                              <p className="text-blue-600 font-medium hover:underline cursor-pointer">multiviewdesign.com.au</p>
                              <p className="text-xs text-gray-500">Website</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin size={20} className="text-gray-400" />
                            <div>
                              <p className="text-gray-900 font-medium">23/61 Pine Rd Yennora NSW 2161</p>
                              <p className="text-xs text-gray-500">Address</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Leave us a message Section in About Tab */}
                      <div className="pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-lg flex items-center gap-2 text-gray-900">
                            <MessageSquare size={20} className="text-blue-600" />
                            Leave us a message
                          </h3>
                          {isAdmin && (
                            <button 
                              onClick={() => setIsEditingContactSettings(true)}
                              className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                              title="Contact Settings"
                            >
                              <RefreshCw size={16} />
                            </button>
                          )}
                        </div>
                        {isMessageSent ? (
                          <div className="bg-green-50 p-8 rounded-2xl border border-green-100 text-center animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Check size={32} />
                            </div>
                            <h4 className="font-bold text-xl text-green-900 mb-2">{confirmationTitle}</h4>
                            <p className="text-green-700 max-w-md mx-auto">
                              {confirmationBody}
                            </p>
                            <button 
                              onClick={() => setIsMessageSent(false)}
                              className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors"
                            >
                              Send another message
                            </button>
                          </div>
                        ) : (
                          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSendMessage}>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Your Name</label>
                                <input 
                                  type="text" 
                                  placeholder="Full Name" 
                                  required
                                  value={messageForm.name}
                                  onChange={e => setMessageForm({...messageForm, name: e.target.value})}
                                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
                                <input 
                                  type="tel" 
                                  placeholder="04xx xxx xxx" 
                                  value={messageForm.phone}
                                  onChange={e => setMessageForm({...messageForm, phone: e.target.value})}
                                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
                                <input 
                                  type="email" 
                                  placeholder="example@mail.com" 
                                  required
                                  value={messageForm.email}
                                  onChange={e => setMessageForm({...messageForm, email: e.target.value})}
                                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                            <div className="space-y-4 flex flex-col">
                              <div className="flex-1 flex flex-col">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Your Message</label>
                                <textarea 
                                  placeholder="How can we help you?" 
                                  required
                                  value={messageForm.content}
                                  onChange={e => setMessageForm({...messageForm, content: e.target.value})}
                                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none flex-1"
                                />
                              </div>
                              <button 
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-100"
                              >
                                <Send size={16} />
                                Send Message
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-2xl mx-auto text-center">
                  <div className="w-24 h-24 mx-auto bg-white rounded-full mb-6 overflow-hidden border-4 border-gray-50 shadow-sm">
                    {profileImage ? (
                      <img src={profileImage} alt="Multiview Logo" className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-white" />
                    )}
                  </div>
                  <h2 className="text-2xl font-bold mb-4">{activeTab} Section</h2>
                  <p className="text-gray-600 mb-6">
                    This section is currently under development. We are bringing you the best of Multiview Design & Pm's {activeTab.toLowerCase()} information soon.
                  </p>
                  <button 
                    onClick={() => setActiveTab('Posts')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Back to Feed
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Post Modal */}
      {isCreatingPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold">Create New Project Post</h2>
              <button onClick={() => setIsCreatingPost(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddPost} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Project Title</label>
                <input 
                  type="text" 
                  value={newPost.title}
                  onChange={e => setNewPost({...newPost, title: e.target.value})}
                  placeholder="e.g. Modern Kitchen Renovation"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea 
                  value={newPost.description}
                  onChange={e => setNewPost({...newPost, description: e.target.value})}
                  placeholder="Describe your project..."
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-bold text-gray-700">Project Media</label>
                  {newPost.images.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => setIsReorderingPostMedia(true)}
                      className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw size={12} />
                      Reorder
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {newPost.images.map((img, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 group">
                      {isVideo(img) ? (
                        <video src={img} className="w-full h-full object-cover" />
                      ) : (
                        <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button 
                          type="button"
                          onClick={() => handleReplacePostImage(index)}
                          className="p-2 bg-white rounded-full text-blue-600 hover:bg-blue-50"
                        >
                          <RefreshCw size={16} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleRemovePostImage(index)}
                          className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button 
                    type="button" 
                    onClick={handleUpdatePostImage}
                    className="aspect-video border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-all flex flex-col items-center justify-center gap-1 font-bold text-xs"
                  >
                    <Plus size={24} />
                    Add Media
                  </button>
                </div>
              </div>

              {/* Media Scheme Preview */}
              {newPost.images.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Media Scheme Preview</h3>
                    <div className="flex gap-1">
                      {['carousel', 'grid', 'verticals'].map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setNewPost({...newPost, layout: l})}
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all",
                            newPost.layout === l ? "bg-blue-600 text-white" : "bg-white text-gray-500 border border-gray-200"
                          )}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={cn(
                    "grid gap-0.5 overflow-hidden rounded-lg border border-gray-200 bg-white",
                    newPost.layout === 'carousel' ? "grid-cols-1" : 
                    newPost.layout === 'verticals' ? "grid-cols-3" :
                    newPost.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
                  )}>
                    {newPost.layout === 'carousel' ? (
                      <div className="relative aspect-video">
                        {newPost.images.length > 0 ? (
                          isVideo(newPost.images[0]) ? (
                            <video src={newPost.images[0]} className="w-full h-full object-cover" />
                          ) : (
                            <img src={newPost.images[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                            <ImageIcon size={32} strokeWidth={1} />
                          </div>
                        )}
                        {newPost.images.length > 1 && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/20 rounded-full flex items-center justify-center text-white">
                            <ChevronRight size={14} />
                          </div>
                        )}
                      </div>
                    ) : newPost.layout === 'verticals' ? (
                      newPost.images.slice(0, 3).map((img, index) => (
                        <div key={index} className="relative aspect-video overflow-hidden">
                          {img ? (
                            isVideo(img) ? (
                              <video src={img} className="w-full h-full object-cover" />
                            ) : (
                              <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            )
                          ) : (
                            <div className="w-full h-full bg-gray-50" />
                          )}
                        </div>
                      ))
                    ) : (
                      newPost.images.slice(0, 4).map((img, index) => (
                        <div 
                          key={index} 
                          className={cn(
                            "relative overflow-hidden",
                            newPost.images.length === 1 ? "aspect-video" : 
                            newPost.images.length === 3 && index === 0 ? "row-span-2 aspect-auto" : "aspect-square"
                          )}
                        >
                          {img ? (
                            isVideo(img) ? (
                              <video src={img} className="w-full h-full object-cover" />
                            ) : (
                              <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            )
                          ) : (
                            <div className="w-full h-full bg-gray-50" />
                          )}
                          {newPost.images.length > 4 && index === 3 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xl font-bold">
                              +{newPost.images.length - 4}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 italic text-center">
                    This is how your {newPost.layout} layout will appear.
                  </p>
                </div>
              )}
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 mt-2"
              >
                Post Project
              </button>
            </form>
          </motion.div>
        </div>
      )}

      <MediaReorderModal 
        isOpen={isReorderingPostMedia}
        onClose={() => setIsReorderingPostMedia(false)}
        images={newPost.images}
        onSave={(images) => setNewPost({...newPost, images})}
      />

      {/* Contact Settings Modal */}
      {isEditingContactSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="font-bold text-xl text-gray-900">Contact Settings</h2>
              <button onClick={() => setIsEditingContactSettings(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Recipient Email</label>
                <input 
                  type="email" 
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g. hello@example.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[10px] text-gray-400 mt-1 italic">This is where client messages will be sent.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Confirmation Title</label>
                <input 
                  type="text" 
                  value={confirmationTitle}
                  onChange={(e) => setConfirmationTitle(e.target.value)}
                  placeholder="e.g. Thanks for reaching out!"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Confirmation Message</label>
                <textarea 
                  value={confirmationBody}
                  onChange={(e) => setConfirmationBody(e.target.value)}
                  placeholder="e.g. We've received your message..."
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <button 
                onClick={() => setIsEditingContactSettings(false)}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                Save Settings
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Image Upload Modals */}
      <ImageUploadModal 
        isOpen={isUpdatingProfileImage}
        onClose={() => setIsUpdatingProfileImage(false)}
        onSave={setProfileImage}
        currentUrl={profileImage}
        title="Update Profile Photo"
        aspectRatio="circle"
      />

      <CoverPhotoManagerModal 
        isOpen={isUpdatingCoverImage}
        onClose={() => setIsUpdatingCoverImage(false)}
        slides={slides}
        onSave={(newSlides) => setSlides(newSlides)}
      />

      <ImageUploadModal 
        isOpen={isUpdatingPostImage}
        onClose={() => setIsUpdatingPostImage(false)}
        onSave={(url) => {
          if (creatingPostImageIndex !== null) {
            const newImages = [...newPost.images];
            newImages[creatingPostImageIndex] = url;
            setNewPost({ ...newPost, images: newImages });
          } else {
            setNewPost({ ...newPost, images: [...newPost.images, url] });
          }
        }}
        onSaveMultiple={(urls) => {
          if (creatingPostImageIndex !== null) {
            const newImages = [...newPost.images];
            newImages.splice(creatingPostImageIndex, 1, ...urls);
            setNewPost({ ...newPost, images: newImages });
          } else {
            setNewPost({ ...newPost, images: [...newPost.images, ...urls] });
          }
        }}
        currentUrl={creatingPostImageIndex !== null ? newPost.images[creatingPostImageIndex] : ""}
        title={creatingPostImageIndex !== null ? "Replace Media" : "Add Media"}
        aspectRatio="rect"
        allowMultiple={creatingPostImageIndex === null}
      />
    </div>
  );
}
