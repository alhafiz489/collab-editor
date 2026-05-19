<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('document.{documentId}', function ($user, $documentId) {
    return true;
});