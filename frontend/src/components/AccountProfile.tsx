import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Eye, EyeOff, User, Mail, Lock, Camera, LogOut } from "lucide-react";
import { toast } from "sonner";
import { t } from "../locales/translations";
import { ErrorNotification } from "./ErrorNotification";
import { updateProfile } from "../utils/profile";
import { useTheme } from "../contexts/ThemeContext";
import { fetchUserProfile, changePassword } from "../api";
interface AccountProfileProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  currentUser: {
    username: string;
    email: string;
    password: string;
    avatar?: string;
  };
  onUpdateProfile: (updates: {
    username?: string;
    email?: string;
    password?: string;
    avatar?: string;
  }) => void;
  language: 'EN' | 'VI';
}

export function AccountProfile({
  isOpen,
  onClose,
  onLogout,
  currentUser,
  onUpdateProfile,
  language,
}: AccountProfileProps) {
  const lang = language.toLowerCase() as 'en' | 'vi';
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar || "");
  const [isSaveBtnHovered, setIsSaveBtnHovered] = useState(false);
  const [isSaveBtnPressed, setIsSaveBtnPressed] = useState(false);
  const [isCancelBtnHovered, setIsCancelBtnHovered] = useState(false);
  const [isCancelBtnPressed, setIsCancelBtnPressed] = useState(false);
  const [isLogoutBtnHovered, setIsLogoutBtnHovered] = useState(false);
  const [isLogoutBtnPressed, setIsLogoutBtnPressed] = useState(false);
  const [isCloseBtnHovered, setIsCloseBtnHovered] = useState(false);
  const [isCloseBtnPressed, setIsCloseBtnPressed] = useState(false);
  const [isChangePasswordBtnHovered, setIsChangePasswordBtnHovered] = useState(false);
  const [isUploadLabelHovered, setIsUploadLabelHovered] = useState(false);
  const { currentTheme } = useTheme();
  const colors = currentTheme.colors;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError(t('invalidImageFile', lang));
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(t('fileTooLarge', lang));
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setAvatarUrl(base64String);
      handleUpdateProfile({ avatar: base64String });
      toast.success(t('avatarUpdated', lang));
      setError(null);
    };
    reader.onerror = () => {
      setError(t('errorReadingFile', lang));
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(t('fillAllFields', lang));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('passwordsDontMatch', lang));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('passwordTooShort', lang));
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await changePassword(currentPassword, newPassword, token);
      toast.success(t('passwordChanged', lang));
      // Optionally refresh user data
      if (token) {
        const updatedUser = await fetchUserProfile(token);
        onUpdateProfile(updatedUser);
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsEditingPassword(false);
      setError(null);
    } catch (err) {
      setError(t('incorrectPassword', lang));
    }
  };

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  async function handleUpdateProfile(updates: {
    username?: string;
    email?: string;
    password?: string;
    avatar?: string;
  }) {
    try {
      await updateProfile(updates);
      toast.success(t('profileUpdated', lang));
      // Fetch latest user data from backend
      const token = localStorage.getItem("token"); // or get from your auth context
      if (token) {
        const updatedUser = await fetchUserProfile(token);
        onUpdateProfile(updatedUser); // update parent/local state
      }
    } catch (err) {
      toast.error(t('updateProfileFailed', lang));
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          setIsEditingPassword(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setError(null);
        }
      }}
    >
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ color: colors.primary }}>
            {t('accountProfile', lang)}
          </DialogTitle>
          <DialogDescription style={{ color: colors.text.secondary }}>
            {t('accountProfileDescription', lang)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4"
                  style={{ borderColor: colors.secondary }}
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}CC 100%)`,
                    borderColor: colors.secondary
                  }}
                >
                  {getInitials(currentUser.username)}
                </div>
              )}
              <div 
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shadow-lg"
                style={{ background: colors.accent }}
              >
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Avatar File Upload */}
            <div className="w-full space-y-2">
              <Label htmlFor="avatar" style={{ color: colors.accent }}>
                {t('uploadAvatar', lang)}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  style={{ borderColor: colors.light }}
                />
                <label
                  htmlFor="avatar"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md border cursor-pointer hover:bg-gray-50 transition-colors"
                  style={{ borderColor: colors.light, color: colors.primary }}
                  onMouseEnter={() => setIsUploadLabelHovered(true)}
                  onMouseLeave={() => setIsUploadLabelHovered(false)}
                >
                  <Camera className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {lang === 'en' ? 'Select Image' : 'Chọn ảnh'}
                  </span>
                </label>
              </div>
              <p className="text-xs text-gray-500">
                {lang === 'en' ? 'Max file size: 5MB' : 'Kích thước tối đa: 5MB'}
              </p>
            </div>
          </div>

          {/* Username Display (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="username" style={{ color: colors.accent }}>
              {t('username', lang)}
            </Label>
            <div className="relative">
              <Input
                id="username"
                type="text"
                value={currentUser.username}
                disabled
                className="pr-12 bg-gray-50"
                style={{ borderColor: colors.light }}
              />
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: colors.accent }} />
            </div>
          </div>

          {/* Email Display (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" style={{ color: colors.accent }}>
              {t('email', lang)}
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={currentUser.email}
                disabled
                className="pr-12 bg-gray-50"
                style={{ borderColor: colors.light }}
              />
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: colors.accent }} />
            </div>
          </div>


          {/* Password Section */}
          {!isEditingPassword ? (
            <div className="flex items-center justify-end py-2">
              <button
                onClick={() => setIsEditingPassword(true)}
                className="text-sm font-medium hover:underline"
                style={{ color: colors.primary }}
                onMouseEnter={() => setIsChangePasswordBtnHovered(true)}
                onMouseLeave={() => setIsChangePasswordBtnHovered(false)}
              >
                {t('changePassword', lang)}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label style={{ color: '#FF8C69' }}>
                  {t('password', lang)}
                </Label>
              </div>

              <div className="space-y-3 p-4 rounded-lg bg-gray-50">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label style={{ color: colors.accent }}>
                    {t('password', lang)}
                  </Label>

                  <Label htmlFor="currentPassword" style={{ color: colors.accent }}>
                    {t('currentPassword', lang)}
                  </Label>
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pr-12"
                    style={{ borderColor: colors.light }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    style={{ color: colors.accent }}
                  >

                      {showCurrentPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" style={{ color: '#FF8C69' }}>
                    {t('newPassword', lang)}
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pr-12"
                      style={{ borderColor: '#FFD9CC' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      style={{ color: '#FF8C69' }}
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" style={{ color: '#FF8C69' }}>
                    {t('confirmPassword', lang)}
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-12"
                      style={{ borderColor: '#FFD9CC' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      style={{ color: '#FF8C69' }}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Change Password Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditingPassword(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setError(null);
                    }}
                    className="flex-1"
                    onMouseEnter={() => setIsCancelBtnHovered(true)}
                    onMouseLeave={() => setIsCancelBtnHovered(false)}
                    onMouseDown={() => setIsCancelBtnPressed(true)}
                    onMouseUp={() => setIsCancelBtnPressed(false)}
                    style={{
                      borderColor: colors.accent,
                      color: colors.accent,
                      padding: '0 16px',
                      boxShadow: isCancelBtnPressed 
                        ? `0 2px 6px ${colors.accent}66` 
                        : (isCancelBtnHovered ? `0 4px 12px ${colors.accent}4D` : 'none'),
                      transform: isCancelBtnPressed ? 'scale(0.97)' : (isCancelBtnHovered ? 'scale(1.02)' : 'scale(1.00)'),
                      transition: isCancelBtnPressed ? 'all 120ms ease-out' : 'all 150ms cubic-bezier(0.16,1,0.3,1)',
                    }}
                  >
                    {t('cancel', lang)}
                  </Button>
                  <button
                    onClick={handleChangePassword}
                    onMouseEnter={() => setIsSaveBtnHovered(true)}
                    onMouseLeave={() => {
                      setIsSaveBtnHovered(false);
                      setIsSaveBtnPressed(false);
                    }}
                    onMouseDown={() => setIsSaveBtnPressed(true)}
                    onMouseUp={() => setIsSaveBtnPressed(false)}
                    className="flex-1 text-white font-semibold rounded-md h-9"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}CC 100%)`,
                      padding: '0 16px',
                      boxShadow: isSaveBtnPressed 
                        ? `0 2px 6px ${colors.primary}66` 
                        : (isSaveBtnHovered ? `0 4px 12px ${colors.primary}4D` : 'none'),
                      transform: isSaveBtnPressed ? 'scale(0.97)' : (isSaveBtnHovered ? 'scale(1.02)' : 'scale(1.00)'),
                      transition: isSaveBtnPressed ? 'all 120ms ease-out' : 'all 150ms cubic-bezier(0.16,1,0.3,1)',
                    }}
                  >

                    {t('save', lang)}
                  </button>
                </div>
              </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={onLogout}
              variant="outline"
              className="flex-1 flex items-center gap-2"
              onMouseEnter={() => setIsLogoutBtnHovered(true)}
              onMouseLeave={() => setIsLogoutBtnHovered(false)}
              onMouseDown={() => setIsLogoutBtnPressed(true)}
              onMouseUp={() => setIsLogoutBtnPressed(false)}
              style={{
                borderColor: colors.highlight,
                color: colors.highlight,
                padding: '0 16px',
                boxShadow: isLogoutBtnPressed 
                  ? `0 2px 6px ${colors.highlight}66` 
                  : (isLogoutBtnHovered ? `0 4px 12px ${colors.highlight}4D` : 'none'),
                transform: isLogoutBtnPressed ? 'scale(0.97)' : (isLogoutBtnHovered ? 'scale(1.02)' : 'scale(1.00)'),
                transition: isLogoutBtnPressed ? 'all 120ms ease-out' : 'all 150ms cubic-bezier(0.16,1,0.3,1)',
              }}
            >

              <LogOut className="w-4 h-4" />
              {t('logout', lang)}
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 text-white"
              onMouseEnter={() => setIsCloseBtnHovered(true)}
              onMouseLeave={() => setIsCloseBtnHovered(false)}
              onMouseDown={() => setIsCloseBtnPressed(true)}
              onMouseUp={() => setIsCloseBtnPressed(false)}
              style={{
                background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.secondary} 100%)`,
                padding: '0 16px',
                boxShadow: isCloseBtnPressed 
                  ? `0 2px 6px ${colors.accent}66` 
                  : (isCloseBtnHovered ? `0 4px 12px ${colors.accent}4D` : 'none'),
                transform: isCloseBtnPressed ? 'scale(0.97)' : (isCloseBtnHovered ? 'scale(1.02)' : 'scale(1.00)'),
                transition: isCloseBtnPressed ? 'all 120ms ease-out' : 'all 150ms cubic-bezier(0.16,1,0.3,1)',
              }}
            >

              {t('close', lang)}
            </Button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <ErrorNotification
            message={error}
            onClose={() => setError(null)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}