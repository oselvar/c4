# TODO

This library is too invasive. It should never throw errors.
All it should do at runtime is to emit @C4Call spans.
These should either enrich the current span with C4 specific
attributes, or send a new span.

All the code about building the model should be kept for now,
but it should be possible to disable it.

At runtime we want to emit spans, but we don't want to build a model
and especially not throw or log errors.
