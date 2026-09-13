<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['user_id', 'original_url', 'short_code', 'clicks'])]
class ShortUrl extends Model
{
    //
}
