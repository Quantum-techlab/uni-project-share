import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, X, FileText, Plus } from 'lucide-react';
import { useServerAuth as useAuth } from '@/hooks/useServerAuth';
import { toast } from '@/hooks/use-toast';

export const ProjectUpload = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    supervisor: '',
    year: new Date().getFullYear(),
    description: '',
    abstract: '',
    keywords: [] as string[],
  });
  const [newKeyword, setNewKeyword] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-detect year from email
  const emailYear = user?.email?.match(/(\d{2})-52HL(\d{3})/)?.[1];
  const suggestedYear = emailYear ? 2000 + parseInt(emailYear) + 4 : new Date().getFullYear(); // +4 for graduation year

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload only PDF, DOC, or DOCX files.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (20MB max)
      if (selectedFile.size > 20 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 20MB.",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a project file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement actual file upload and project creation
      console.log('Uploading project:', { formData, file });
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Project uploaded successfully!",
        description: "Your project has been added to the repository.",
      });

      // Reset form
      setFormData({
        title: '',
        supervisor: '',
        year: suggestedYear,
        description: '',
        abstract: '',
        keywords: [],
      });
      setFile(null);
      setNewKeyword('');
      
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white border border-slate-200 shadow-sm max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload Final Year Project
        </CardTitle>
        <CardDescription>
          Share your final year project with the Information Technology Department. All fields are required unless marked as optional.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter your project title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supervisor">Supervisor Name *</Label>
              <Input
                id="supervisor"
                value={formData.supervisor}
                onChange={(e) => handleInputChange('supervisor', e.target.value)}
                placeholder="e.g., Dr. John Smith"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year of Submission *</Label>
            <Input
              id="year"
              type="number"
              value={formData.year}
              onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
              min="2015"
              max={new Date().getFullYear() + 1}
              required
            />
            {emailYear && (
              <p className="text-xs text-slate-500">
                Suggested year based on your email: {suggestedYear}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="abstract">Abstract/Summary *</Label>
            <Textarea
              id="abstract"
              value={formData.abstract}
              onChange={(e) => handleInputChange('abstract', e.target.value)}
              placeholder="Provide a brief summary of your project (150-300 words)"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Provide a detailed description of your project, including objectives, methodology, and outcomes"
              rows={6}
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Keywords/Tags (Optional)</Label>
            <div className="flex gap-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Add a keyword"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
              />
              <Button type="button" onClick={addKeyword} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {formData.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {keyword}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => removeKeyword(keyword)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label htmlFor="file">Project File *</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {!file ? (
                <div className="space-y-2">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto" />
                  <div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => document.getElementById('file')?.click()}
                    >
                      Choose File
                    </Button>
                  </div>
                  <p className="text-sm text-slate-500">
                    PDF, DOC, or DOCX files only (max 20MB)
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <FileText className="h-12 w-12 text-primary mx-auto" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    Remove File
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200">
            <Button 
              type="submit" 
              disabled={isLoading || !file || !formData.title || !formData.supervisor}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading project...
                </div>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Project
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
