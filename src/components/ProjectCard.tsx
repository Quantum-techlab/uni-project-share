import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Calendar, User, Tag } from 'lucide-react';

interface ProjectCardProps {
  title: string;
  supervisor: string;
  year: number;
  abstract: string;
  keywords: string[];
  uploadedBy: string;
  uploadDate: string;
}

export const ProjectCard = ({
  title,
  supervisor,
  year,
  abstract,
  keywords,
  uploadedBy,
  uploadDate
}: ProjectCardProps) => {
  const truncatedAbstract = abstract.length > 150 
    ? `${abstract.slice(0, 150)}...` 
    : abstract;

  const handleDownload = () => {
    // TODO: Implement actual download functionality
    console.log('Downloading project:', title);
  };

  return (
    <Card className="academic-paper hover:shadow-elegant transition-smooth group">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight group-hover:text-primary transition-smooth">
            {title}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {year}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{supervisor}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <CardDescription className="text-sm leading-relaxed">
          {truncatedAbstract}
        </CardDescription>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {keywords.slice(0, 3).map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
              {keywords.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{keywords.length - 3} more
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(uploadDate).toLocaleDateString()}</span>
            </div>
            <span className="font-mono text-xs">
              {uploadedBy.split('@')[0]}
            </span>
          </div>
        </div>
        
        <Button 
          onClick={handleDownload}
          className="w-full transition-smooth bg-primary hover:bg-primary/90"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Project
        </Button>
      </CardContent>
    </Card>
  );
};