
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Users, 
  Calendar,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { useDocument } from '@/contexts/DocumentContext';

export const AnalyticsDashboard = () => {
  const { documents, templates, getDocumentStats } = useDocument();
  const stats = getDocumentStats();

  const getStatusCounts = () => {
    return documents.reduce((acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const getRecentActivity = () => {
    return documents
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 5);
  };

  const getTemplateUsage = () => {
    return templates
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5);
  };

  const getCompletionRate = () => {
    const sent = documents.filter(d => d.status === 'sent' || d.status === 'completed').length;
    const completed = documents.filter(d => d.status === 'completed').length;
    return sent > 0 ? Math.round((completed / sent) * 100) : 0;
  };

  const statusCounts = getStatusCounts();
  const recentActivity = getRecentActivity();
  const topTemplates = getTemplateUsage();
  const completionRate = getCompletionRate();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'sent':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'draft':
        return <FileText className="h-4 w-4 text-gray-600" />;
      case 'declined':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'sent':
        return 'text-blue-600 bg-blue-50';
      case 'draft':
        return 'text-gray-600 bg-gray-50';
      case 'declined':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold">{completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Document Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(statusCounts).map(([status, count]) => {
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <span className="capitalize font-medium">{status}</span>
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Average Completion Time</span>
              <span className="text-lg font-bold">
                {stats.averageCompletionTime.toFixed(1)} days
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Total Templates</span>
              <span className="text-lg font-bold">{templates.length}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Template Usage</span>
              <span className="text-lg font-bold">
                {templates.reduce((sum, t) => sum + t.usageCount, 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Top Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              ) : (
                recentActivity.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(doc.status)}
                      <div>
                        <p className="font-medium text-sm">{doc.title}</p>
                        <p className="text-xs text-gray-600">
                          Updated {doc.updatedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(doc.status)}
                    >
                      {doc.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Most Used Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topTemplates.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No templates created yet</p>
              ) : (
                topTemplates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{template.name}</p>
                      <p className="text-xs text-gray-600">{template.category || 'Uncategorized'}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{template.usageCount} uses</Badge>
                      <p className="text-xs text-gray-600 mt-1">
                        {template.fields.length} fields
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
