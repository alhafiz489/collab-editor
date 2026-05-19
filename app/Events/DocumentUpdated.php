<?php

namespace App\Events;

use App\Models\Document;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DocumentUpdated implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public $documentId;
    public $content;

    public function __construct(Document $document, $content)
    {
        $this->documentId = $document->id;
        $this->content = $content;
    }

    public function broadcastOn(): Channel
    {
        return new Channel('document.' . $this->documentId);
    }

    public function broadcastAs(): string
    {
        return 'document.updated';
    }
}