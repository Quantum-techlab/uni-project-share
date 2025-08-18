import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Upload, 
  Download, 
  Filter, 
  GraduationCap, 
  User, 
  LogOut,
  FileText,
  Calendar,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectUpload } from '@/components/ProjectUpload';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'browse' | 'upload' | 'profile'>('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [supervisorFilter, setSupervisorFilter] = useState<string>('all');

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-primary text-white border-b border-primary/20 shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img 
                src="/public/image.png" 
                alt="Department Logo" 
                className="h-10 w-10 object-contain"
                onError={(e) => {
                  // Fallback to graduation cap icon if logo fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <GraduationCap className="h-8 w-8 text-white hidden" />
              <div>
                <h1 className="text-xl font-bold text-white">
                  Department  Project Repository
                </h1>
                <p className="text-xs text-white/80">
                  University of Ilorin • Information Technology
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-white/90">
                <User className="h-4 w-4" />
                <span className="text-sm">{user.email}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="border-white/20 text-white hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={activeTab === 'browse' ? 'default' : 'outline'}
            onClick={() => setActiveTab('browse')}
            className="transition-smooth"
          >
            <FileText className="h-4 w-4 mr-2" />
            Browse Projects
          </Button>
          <Button
            variant={activeTab === 'upload' ? 'default' : 'outline'}
            onClick={() => setActiveTab('upload')}
            className="transition-smooth"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Project
          </Button>
          <Button
            variant={activeTab === 'profile' ? 'default' : 'outline'}
            onClick={() => setActiveTab('profile')}
            className="transition-smooth"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Profile
          </Button>
        </div>

        {/* Browse Projects Tab */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            {/* Filters */}
            <Card className="bg-white border border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  Search & Filter Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title, supervisor, or keywords..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                      <SelectItem value="2021">2021</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={supervisorFilter} onValueChange={setSupervisorFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by supervisor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Supervisors</SelectItem>
                      <SelectItem value="dr-smith">Dr. Smith</SelectItem>
                      <SelectItem value="prof-johnson">Prof. Johnson</SelectItem>
                      <SelectItem value="dr-wilson">Dr. Wilson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProjectCard
                title="Machine Learning Approach to Student Performance Prediction"
                supervisor="Dr. Adebayo Smith"
                year={2024}
                abstract="This research explores the application of machine learning algorithms to predict student academic performance based on various factors including attendance, assignment scores, and engagement metrics."
                keywords={['Machine Learning', 'Education', 'Prediction', 'Academic Performance']}
                uploadedBy="22-52HL045@students.unilorin.edu.ng"
                uploadDate="2024-08-15"
              />
              
              <ProjectCard
                title="Blockchain-Based Voting System for University Elections"
                supervisor="Prof. Fatima Johnson"
                year={2024}
                abstract="Development of a secure, transparent, and tamper-proof voting system using blockchain technology for university student elections."
                keywords={['Blockchain', 'Security', 'Voting', 'Democracy']}
                uploadedBy="22-52HL123@students.unilorin.edu.ng"
                uploadDate="2024-08-10"
              />
              
              <ProjectCard
                title="Mobile Health Application for Diabetes Management"
                supervisor="Dr. Ahmed Wilson"
                year={2023}
                abstract="A comprehensive mobile application designed to help diabetes patients monitor their blood glucose levels, track medication, and maintain healthy lifestyle habits."
                keywords={['Mobile App', 'Healthcare', 'Diabetes', 'Health Monitoring']}
                uploadedBy="21-52HL089@students.unilorin.edu.ng"
                uploadDate="2023-12-05"
              />
            </div>
          </div>
        )}

        {/* Upload Project Tab */}
        {activeTab === 'upload' && (
          <ProjectUpload />
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card className="academic-paper max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Student Profile
              </CardTitle>
              <CardDescription>
                Your academic information and system access details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                  <p className="font-mono text-sm bg-muted p-2 rounded">{user.email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Status</label>
                  <div className="mt-1">
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Verified Student
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Student ID</label>
                  <p className="text-sm bg-muted p-2 rounded">
                    {user.email?.match(/(\d{2})-52HL(\d{3})/)?.[0] || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Admission Year</label>
                  <p className="text-sm bg-muted p-2 rounded">
                    20{user.email?.match(/(\d{2})-52HL(\d{3})/)?.[1] || 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <h4 className="font-medium mb-2">System Access</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-green-600" />
                    <span>Download projects: Enabled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-green-600" />
                    <span>Upload projects: Enabled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>Last login: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
