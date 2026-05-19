<?php

namespace App\Http\Controllers;

use App\Events\DocumentUpdated;
use App\Models\Document;
use App\Models\DocumentVersion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function index()
    {
        return Inertia::render('Documents/Index', [
            'documents' => Document::latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $document = Document::create([
            'user_id' => auth()->id(),
            'title' => $request->title,
            'content' => '',
        ]);

        return redirect()->route('documents.edit', $document);
    }

    public function edit(Document $document)
    {
        return Inertia::render('Documents/Edit', [
            'document' => $document,
        ]);
    }

   public function broadcast(Request $request, Document $document)
{
    broadcast(new DocumentUpdated($document, $request->content))->toOthers();

    return response()->json([
        'success' => true,
    ]);
}
    public function update(Request $request, Document $document)
    {
        $document->update([
            'content' => $request->content,
        ]);

        DocumentVersion::create([
            'document_id' => $document->id,
            'content' => $request->content,
        ]);

        return response()->json([
            'message' => 'Saved',
        ]);
    }

    public function versions(Document $document)
    {
        return Inertia::render('Documents/Versions', [
            'document' => $document,
            'versions' => DocumentVersion::where('document_id', $document->id)
                ->latest()
                ->get(),
        ]);
    }
}