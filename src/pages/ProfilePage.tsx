import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { User, Mail, Phone, Camera, Save, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', profileImage: user?.profileImage || '' });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return <Navigate to="/login" />;

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'profile');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setForm({ ...form, profileImage: data.url });
        toast.success('Image uploaded successfully!');
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSave = async () => {
    const success = await updateProfile(form);
    if (success) {
      setEditing(false);
      toast.success('Profile updated successfully!');
    } else {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div>
      <section className="bg-gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gold/20 border-2 border-gold/30">
            {form.profileImage ? (
              <img src={form.profileImage} alt={form.name} className="h-full w-full rounded-full object-cover" />
            ) : (
              <User className="h-12 w-12 text-gold" />
            )}
          </div>
          <h1 className="font-heading text-3xl font-bold text-secondary">{user.name}</h1>
          <p className="text-secondary/70 text-sm">{user.email}</p>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold text-card-foreground">Profile Details</h2>
              {!editing ? (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit Profile</Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleSave}><Save className="h-3 w-3 mr-1" /> Save</Button>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1"><User className="h-3 w-3" /> Full Name</label>
                {editing ? <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /> : <p className="text-card-foreground font-medium">{user.name}</p>}
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1"><Mail className="h-3 w-3" /> Email</label>
                {editing ? <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /> : <p className="text-card-foreground font-medium">{user.email}</p>}
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1"><Phone className="h-3 w-3" /> Phone</label>
                {editing ? <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" /> : <p className="text-card-foreground font-medium">{user.phone || 'Not provided'}</p>}
              </div>
              {editing && (
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1"><Camera className="h-3 w-3" /> Profile Image</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-3 w-3" />
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </Button>
                    {form.profileImage && (
                      <span className="text-xs text-muted-foreground">Image uploaded</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-border bg-card p-4 text-center">
              <p className="font-heading text-2xl font-bold text-card-foreground">{user.enrolledCourses.length}</p>
              <p className="text-xs text-muted-foreground">Enrolled</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-center">
              <p className="font-heading text-2xl font-bold text-card-foreground">{user.completedCourses.length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-center">
              <p className="font-heading text-2xl font-bold text-card-foreground">{user.certificates.length}</p>
              <p className="text-xs text-muted-foreground">Certificates</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
