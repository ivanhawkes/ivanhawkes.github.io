---
author: Ivan Hawkes
date: '2026-04-30'
title: Test Page
---

Use this page for testing features.

<!--more-->

# Linenos = true, hl_inline = false

```cpp { linenos = true, hl_inline = false }

  bool Serialize(Serialization::IArchive& archive)
  {
    archive(base, "base", "base");
    archive(baseModifiers, "baseModifiers", "baseModifiers");
    archive(modifiers, "modifiers", "modifiers");

    return true;
  }
```

# Linenos = false, hl_inline = false

```xml { linenos = false, hl_inline = false }
<Node OldClass="entity:MissionObjective" NewClass="entity:MissionObjective">
  <InputPort  OldName="DisableObjective" NewName="Deactivate" />
  <InputPort  OldName="EnableObjective"  NewName="Activate" />
  <OutputPort OldName="DisableObjective" NewName="Deactivated" />
  <OutputPort OldName="EnableObjective"  NewName="Activated" />
</Node>
```
