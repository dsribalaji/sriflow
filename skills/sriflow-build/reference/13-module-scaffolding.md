# Module Scaffolding

Stubs pattern for generating new modules, components, or features. Standardized structure ensures consistency.

## Stub Types

| Stub | Purpose | Variables |
|------|---------|-----------|
| **Model** | Database model with relationships | `moduleName`, `entityName`, `tableNamePlural` |
| **Controller** | HTTP controller with Inertia render | `moduleName` |
| **Migration** | Database migration | `tableNamePlural`, `moduleName` |
| **Page** | Frontend page component | `moduleName`, `entityName` |
| **Policy** | Authorization policy | `moduleName`, `entityName` |
| **Config** | Module configuration | `moduleName` |
| **Routes** | Web/API routes | `moduleName` |

## Model Stub

```php
<?php

namespace Modules\{{moduleName}}\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\{
  Factories\HasFactory,
  Model,
  Relations\BelongsTo
};

class {{entityName}} extends Model
{
    use HasFactory;

    protected $table = '{{tableNamePlural}}';

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }
}
```

## Controller Stub

```php
<?php

namespace Modules\{{moduleName}}\Http\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class {{moduleName}}Controller extends Controller
{
    public function index(): Response
    {
        return Inertia::render('{{moduleName}}::index');
    }
}
```

## Module Config Stub

```json
{
    "name": "{{moduleName}}",
    "alias": "{{moduleNameAlias}}",
    "description": "",
    "keywords": [],
    "priority": 0,
    "providers": [
        "Modules\\{{moduleName}}\\Providers\\{{moduleName}}ServiceProvider"
    ],
    "files": []
}
```

## Module Directory Structure

```
Modules/
├── {{moduleName}}/
│   ├── app/
│   │   ├── Console/
│   │   └── Providers/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── resources/
│   │   ├── js/
│   │   │   ├── pages/
│   │   │   └── types/
│   │   └── views/
│   ├── routes/
│   ├── tests/
│   ├── composer.json
│   ├── module.json
│   ├── package.json
│   └── vite.config.js
```

## Placeholder Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `{{moduleName}}` | `Finance` | PascalCase module name |
| `{{moduleNameAlias}}` | `finance` | kebab-case alias |
| `{{entityName}}` | `Transaction` | PascalCase entity name |
| `{{tableNamePlural}}` | `transactions` | snake_case table name |

## Usage

1. Copy stub to target location
2. Replace all `{{variable}}` placeholders
3. Customize `fillable` fields for entity
4. Add relationships, scopes, casts as needed
5. Create corresponding migration, controller, page

## sriflow Adaptation

When sriflow-build creates new files:
- Use stubs as starting points
- Customize for project's patterns
- Ensure consistent structure across features
- Keep stubs minimal — add only what's needed
