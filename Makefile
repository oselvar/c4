D2_FILES := $(shell find src/examples/workspace -name "*.d2")

all: $(D2_FILES:%.d2=%.svg)

%.svg: %.d2
	d2 $< $@

.PHONY: all

