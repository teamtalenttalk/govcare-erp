import { useEffect, useState, useCallback } from 'react';
import { Search, Upload, File, Trash2, Tag, FolderOpen, FileText, Image, FileSpreadsheet, Edit2 } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface Doc {
  id: string;
  name: string;
  original_filename: string;
  mime_type: string | null;
  file_size: number;
  entity_type: string | null;
  entity_id: string | null;
  description: string | null;
  tags: string[] | null;
  category: string | null;
  created_at: string;
}

const CATEGORIES = ['Contract', 'Invoice', 'Receipt', 'Report', 'Compliance', 'HR', 'Payroll', 'Other'];
const ENTITY_TYPES = ['contract', 'invoice', 'bill', 'expense', 'project', 'employee', 'vendor', 'customer'];

function fileIcon(mime: string | null) {
  if (!mime) return <File className="h-4 w-4" />;
  if (mime.startsWith('image/')) return <Image className="h-4 w-4 text-purple-400" />;
  if (mime.includes('spreadsheet') || mime.includes('excel') || mime.includes('csv')) return <FileSpreadsheet className="h-4 w-4 text-green-400" />;
  if (mime.includes('pdf')) return <FileText className="h-4 w-4 text-red-400" />;
  return <File className="h-4 w-4 text-blue-400" />;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function DocumentManager() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<Doc | null>(null);

  // Upload form
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadEntityType, setUploadEntityType] = useState('');
  const [uploadEntityId, setUploadEntityId] = useState('');
  const [uploadTags, setUploadTags] = useState('');

  // Edit form
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTags, setEditTags] = useState('');

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/documents', {
        params: { search, category: categoryFilter || undefined, page, per_page: perPage },
      });
      setDocs(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch {
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, page, perPage]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleUpload = async () => {
    if (!uploadFile) return;
    const fd = new FormData();
    fd.append('file', uploadFile);
    if (uploadName) fd.append('name', uploadName);
    if (uploadDesc) fd.append('description', uploadDesc);
    if (uploadCategory) fd.append('category', uploadCategory);
    if (uploadEntityType) fd.append('entity_type', uploadEntityType);
    if (uploadEntityId) fd.append('entity_id', uploadEntityId);
    if (uploadTags) {
      uploadTags.split(',').map(t => t.trim()).filter(Boolean).forEach((t, i) => fd.append(`tags[${i}]`, t));
    }
    try {
      await api.post('/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadOpen(false);
      resetUploadForm();
      fetchDocs();
    } catch { /* */ }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadName('');
    setUploadDesc('');
    setUploadCategory('');
    setUploadEntityType('');
    setUploadEntityId('');
    setUploadTags('');
  };

  const openEdit = (doc: Doc) => {
    setEditDoc(doc);
    setEditName(doc.name);
    setEditDesc(doc.description || '');
    setEditCategory(doc.category || '');
    setEditTags(doc.tags?.join(', ') || '');
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editDoc) return;
    try {
      await api.put(`/documents/${editDoc.id}`, {
        name: editName,
        description: editDesc,
        category: editCategory,
        tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
      });
      setEditOpen(false);
      fetchDocs();
    } catch { /* */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    try {
      await api.delete(`/documents/${id}`);
      fetchDocs();
    } catch { /* */ }
  };

  const lastPage = Math.ceil(total / perPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Document Manager</h1>
        </div>
        <Button onClick={() => { setUploadOpen(true); resetUploadForm(); }}>
          <Upload className="h-4 w-4 mr-2" />Upload Document
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v === 'ALL' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Linked To</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead className="text-right">Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {docs.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>{fileIcon(d.mime_type)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{d.name}</p>
                          <p className="text-xs text-muted-foreground">{d.original_filename}</p>
                        </div>
                      </TableCell>
                      <TableCell>{d.category ? <Badge variant="outline">{d.category}</Badge> : '---'}</TableCell>
                      <TableCell className="text-xs">{d.entity_type ? `${d.entity_type}` : '---'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {d.tags?.map((t) => (
                            <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-xs">{formatSize(d.file_size)}</TableCell>
                      <TableCell className="text-xs">{new Date(d.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(d)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {docs.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No documents found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
              {lastPage > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">Page {page} of {lastPage} ({total} records)</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage(page + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>File</Label>
              <Input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Name (optional)</Label><Input value={uploadName} onChange={(e) => setUploadName(e.target.value)} placeholder="Document name" /></div>
              <div>
                <Label>Category</Label>
                <Select value={uploadCategory} onValueChange={setUploadCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Description</Label><Input value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Link to Entity Type</Label>
                <Select value={uploadEntityType} onValueChange={setUploadEntityType}>
                  <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>{ENTITY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Entity ID</Label><Input value={uploadEntityId} onChange={(e) => setUploadEntityId(e.target.value)} placeholder="UUID" /></div>
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input value={uploadTags} onChange={(e) => setUploadTags(e.target.value)} placeholder="e.g. dcaa, audit, 2026" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={!uploadFile}>Upload</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div><Label>Name</Label><Input value={editName} onChange={(e) => setEditName(e.target.value)} /></div>
            <div><Label>Description</Label><Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} /></div>
            <div>
              <Label>Category</Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input value={editTags} onChange={(e) => setEditTags(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
