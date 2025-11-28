package utils

import (
	"encoding/json"
	"errors"
	"io"
)

// DecodeJSON decodes JSON from a reader into the destination struct
// Disallows unknown fields for strict validation
func DecodeJSON(r io.Reader, dest any) error {
	dec := json.NewDecoder(r)
	dec.DisallowUnknownFields()
	if err := dec.Decode(dest); err != nil {
		if errors.Is(err, io.EOF) {
			return errors.New("request body cannot be empty")
		}
		return err
	}
	return nil
}

