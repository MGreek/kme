package com.example.kmebackend.model

import jakarta.persistence.*

enum class StemType {
    Whole,
    Half,
    Quarter,
    Eight,
    Sixteenth,
    Thirtysecond,
    Sixtyfourth,
}

@Embeddable
data class Stem(
    @Enumerated(EnumType.STRING)
    val stemType: StemType,
    val metadataJson: String = "",
)