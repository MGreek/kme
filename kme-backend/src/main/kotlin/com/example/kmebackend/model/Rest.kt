package com.example.kmebackend.model

import jakarta.persistence.*

enum class RestType {
    Whole,
    Half,
    Quarter,
    Eight,
    Sixteenth,
    Thirtysecond,
    Sixtyfourth,
}

@Embeddable
data class RestId(
    @Embedded
    val groupingEntryId: GroupingEntryId,
)

@Entity
data class Rest(
    @EmbeddedId
    val restId: RestId,
    @Enumerated(EnumType.STRING)
    val restType: RestType,
    val metadata: String? = null,
)
